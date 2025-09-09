import { Types } from "mongoose";
import { Interview } from "../models/InterviewSchema";
import { IScheduleInterviewRequest, IQuestionAnswer } from "../types/interview";

class InterviewService{

    async createNewInterview (interviewData: IScheduleInterviewRequest){
        const { candidate, job, deadline } = interviewData;

        // Create questions with reference answers
        const QAwithRef: IQuestionAnswer[] =
            job.interviewQA?.map((QA: any) => ({
                question: QA.question,
                candidateAnswer: "",
                referenceAnswer: QA.referenceAnswer,
            })) || [];

        const interview = new Interview({
            candidateId: candidate.id,
            candidateEmail: candidate.email,
            candidateName: candidate.name,
            jobId: job.id,
            jobTitle: job.title,
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
    
}

export const interviewService = new InterviewService();