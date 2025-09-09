import { Types } from "mongoose";
import { Interview } from "../models/InterviewSchema";
import { IScheduleInterviewRequest, IQuestionAnswer } from "../types/interview";
import sendToLLM from "../config/OpenRouter";
import logger from "../utils/logger";

class InterviewService{

    async createNewInterview (interviewData: IScheduleInterviewRequest){
        const { candidate, job, organization, deadline } = interviewData;

        // Create questions with reference answers
        const QAwithRef: IQuestionAnswer[] =
            job.interviewQA?.map((QA: any) => ({
                question: QA.question,
                candidateAnswer: "I",
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

    async generateSummaryUsingLLM (InterviewQA : IQuestionAnswer[]){
      const prompt  : string  = generateInterviewSummaryPrompt(InterviewQA);
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
}

export const interviewService = new InterviewService();