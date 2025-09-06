import { Request, Response } from 'express';
import { InterviewTranscript, QAwithReference } from '../models/InterviewSchema';
import { jobService } from '../services/JobService';
import { 
  IScheduleInterviewRequest, 
  IScheduleInterviewResponse, 
  IJobResponse,
  IQuestionAnswer
} from '../types/interview';

export class InterviewController {
  async scheduleInterview(req: Request<{}, IScheduleInterviewResponse, IScheduleInterviewRequest>, res: Response<IScheduleInterviewResponse>): Promise<void> {
    try {
      const { candidateId, candidateEmail, candidateName, jobId } = req.body;


      if (!candidateId || !candidateEmail || !candidateName || !jobId) {
        res.status(400).json({
          success: false,
          message: "candidateId, candidateEmail, candidateName, and jobId are required",
        });
        return;
      }

      // Fetch job details
      const jobResponse = await jobService.getJobById(jobId);
      console.log(jobResponse)

      if (!jobResponse.success || !jobResponse.data) {
        res.status(404).json({
          success: false,
          message: "failed to fetch job from job-service",
        });
        return;
      }

      const job = jobResponse.data;
      
      // Create questions with reference answers
      const QAwithRef: IQuestionAnswer[] =
        job.interviewQA?.map((QA: any) => ({
          question: QA.question,
          candidateAnswer: "",
          referenceAnswer: QA.referenceAnswer,
        })) || [];
        
        console.log(QAwithRef);
        
        console.log("Job details:", job.title);
      // Create interview transcript
      const interview = new InterviewTranscript({
        candidateId,
        candidateEmail,
        candidateName,
        jobId,
        jobTitle: job.title,
        scheduledAt: new Date(),
        questionsAnswers: QAwithRef,
        interviewStatus: "SCHEDULED",
      });

      // Save interview to database
      const savedInterview = await interview.save();

      // Send success response
      res.status(201).json({
        success: true,
        message: "Interview scheduled successfully",
        data: {
          interviewId: (savedInterview._id as any).toString(),
          candidateId: savedInterview.candidateId.toString(),
          jobId: savedInterview.jobId.toString(),
          jobTitle: savedInterview.jobTitle,
          scheduledAt: savedInterview.scheduledAt,
          totalQuestions: savedInterview.totalQuestions,
          status: savedInterview.interviewStatus,
        },
      });
    } catch (error: any) {
      console.error("Error scheduling interview:", error);

      if (error.name === "ValidationError") {
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: Object.values(error.errors).map((err: any) => err.message),
        });
        return;
      }

      if (error.response && error.response.status === 404) {
        res.status(404).json({
          success: false,
          message: "Job service not found or job does not exist",
        });
        return;
      }

      if (error.message === 'Job not found') {
        res.status(404).json({
          success: false,
          message: "Job does not exist",
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Failed to schedule interview",
      });
    }
  }

  async addTranscriptToInterview(req: Request, res: Response) : Promise<void>{
    const { transcript } = req.body;
    const { interviewId } = req.params;

    const updatedUser = await InterviewTranscript.findByIdAndUpdate(
      interviewId,
      { $set: {questionsAnswers: transcript} }, 
      { new: true, runValidators: true } 
    ).orFail();

    console.log(updatedUser);

    res.status(200).json({
        success: true,
        data: updatedUser
    });
  }

  

}

export const interviewController = new InterviewController();
