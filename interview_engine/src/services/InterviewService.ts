import { Types, UpdateResult } from "mongoose";
import { Interview, InterviewStatus } from "../models/InterviewSchema";
import { IScheduleInterviewRequest, IQuestionAnswer, IntegrityMetrics, InterviewIntegrityState, IntegrityUpdateResponse, Questions } from "../types/interview.types";
import sendToLLM from "../config/OpenRouter";
import logger from "../utils/logger";
import { generateInterviewSummaryPrompt } from "../prompts/InterviewSummary.prompt";
import { IInterviewEvaluation, TranscriptMessage } from "../types/evaluation.types";
import { generateMappingPrompt, TranscriptQA } from "../prompts/transcript.mapper.prompt";
import { evaluateInterview } from "./EvaluateInterview";
import { InterviewEvaluation } from "../models/InterviewEvaluationSchema";

class InterviewService{

    async createNewInterview (interviewData: IScheduleInterviewRequest){
        const { candidate, job, organization, deadline } = interviewData;

        // Create questions with reference answers
        const QAwithRef: IQuestionAnswer[] =
            job.interviewQA?.map((QA: any) => ({
                question: QA.question,
                candidateAnswer: null,
                referenceAnswer: QA.referenceAnswer,
            })) || [];

        const interview = new Interview({
            candidateId: candidate.id,
            candidateEmail: candidate.email,
            candidateName: candidate.name,
            jobId: job.id,
            jobTitle: job.title,
            organizationId : organization.id, 
            deadline: deadline,
            interviewStatus: "SCHEDULED",
            questionsAnswers: QAwithRef,
            
        });

        // Save interview to database
        const savedInterview = await interview.save();
        
        return {
            interviewId: (savedInterview._id as any).toString(),
            candidateId: savedInterview.candidateId.toString(),
            candidateEmail: savedInterview.candidateEmail,
            jobId: savedInterview.jobId.toString(),
            jobTitle: savedInterview.jobTitle,
            organizationId: savedInterview.organizationId.toString(),
            deadline: savedInterview.deadline,
            totalQuestions: savedInterview.totalQuestions,
            status: savedInterview.interviewStatus,
        };
    }

    async getAllInterviewsOfAUser ( id : string){
        const candidateObjectId = new Types.ObjectId(id);
        return await Interview.findByCandidate(candidateObjectId);
    }

    async getInterviewById ( interviewId: string ){
        return await Interview.findById(interviewId).orFail();
    }
    
    async fetchSummaryById ( interviewId: string ){
        return await Interview.findById(interviewId, 'summary');
    }
    
    async markInterviewAsCompleted(interviewId: string) : Promise<UpdateResult> {
      return await Interview.updateMany(
        {_id: interviewId},
        {$set : { interviewStatus: InterviewStatus.COMPLETED }}
      )
    }

    async generateSummaryUsingLLM (transcript : TranscriptMessage[]){
      const prompt  : string  = generateInterviewSummaryPrompt(transcript);
      const summary : string  = await sendToLLM(prompt);
      let cleaned = typeof summary === "string"
        ? summary
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/```$/, "")
            .trim()
        : summary;

      let parsedSummary = JSON.parse(cleaned);

      logger.info("Summary of the Interview : ", { parsedSummary });
      return parsedSummary;
    }

    async generateInterviewEvaluation (InterviewQA : IQuestionAnswer[], integrityScore: number){
      const evaluation : IInterviewEvaluation = await evaluateInterview(InterviewQA, integrityScore);
      console.log("generated evaluation of the Interview : ", evaluation);
      const interviewEvaluation = new InterviewEvaluation(evaluation);
      await interviewEvaluation.save();
    }
    

    async mapTranscriptToQA(transcript : TranscriptMessage[], QA: IQuestionAnswer[]) : Promise<TranscriptQA[]> {
      const questions : Questions[] = QA.map((qa)=>{
        return {
          question: qa.question
        }
      })
      const prompt   : string = generateMappingPrompt(transcript, questions);
      const response : string = await sendToLLM(prompt);
      return JSON.parse(response);
    }

    async fetchEvaluationByInterviewId(interviewId : string){
      return await InterviewEvaluation.find({interviewId});
    }

}

export const interviewService = new InterviewService();