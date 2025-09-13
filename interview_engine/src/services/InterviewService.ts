import { Types } from "mongoose";
import { Interview } from "../models/InterviewSchema";
import { IScheduleInterviewRequest, IQuestionAnswer, IntegrityMetrics } from "../types/interview.types";
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


    calculateIntegrityScore(metrics: IntegrityMetrics): number {
    const { faceCount, eyeContact, speaking, blinkRate } = metrics;

    // ---- Sub-scores ----
    // Face Score
    let faceScore: number;
    if (faceCount === 1) {
        faceScore = 1;
    } else if (faceCount === 0) {
        faceScore = 0;
    } else {
        // Penalize multiple faces: 1/faceCount (e.g. 2 faces => 0.5)
        faceScore = Math.max(0, 1 / faceCount);
    }

    // Eye Contact Score
    const gazeScore = Math.min(Math.max(eyeContact, 0), 1);

    // Speaking Score
    const speakScore = Math.min(Math.max(speaking, 0), 1);

    // Blink Score
    const normalBlinkRate = 0.08; // ~5 blinks per minute (screen focus baseline)
    let blinkScore =
        1 - Math.min(1, Math.abs(blinkRate - normalBlinkRate) / normalBlinkRate);
    blinkScore = Math.max(0, Math.min(blinkScore, 1));

    // ---- Weighted Combination ----
    const wFace = 2;
    const wGaze = 1;
    const wSpeak = 1;
    const wBlink = 1;

    const weightedScore =
        (wFace * faceScore +
        wGaze * gazeScore +
        wSpeak * speakScore +
        wBlink * blinkScore) /
        (wFace + wGaze + wSpeak + wBlink);

    // Clamp to [0,1]
    return Math.max(0, Math.min(weightedScore, 1));
    }

}

export const interviewService = new InterviewService();