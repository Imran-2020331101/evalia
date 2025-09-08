import { Request, Response } from 'express';
import { Interview, QAwithReference } from '../models/InterviewSchema';
import { jobService } from '../services/JobService';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError, NotFoundError } from '../errors';
import {z} from 'zod';
import { 
  IScheduleInterviewRequest, 
  IScheduleInterviewResponse, 
  IJobResponse,
  IQuestionAnswer,
  ScheduleInterviewRequest
} from '../types/interview';

export class InterviewController {

  scheduleInterview = asyncHandler(async (req: Request, res: Response): Promise<void> => {

    const validationResult = ScheduleInterviewRequest.safeParse(req.body);
    if(!validationResult.success){
      throw new BadRequestError(`Validation failed: ${validationResult.error.issues.map(issue => issue.message).join(', ')}`);
    }

    const { candidate, job, deadline  } = validationResult.data;
  
    // Create questions with reference answers
    const QAwithRef: IQuestionAnswer[] =
      job.interviewQA?.map((QA: any) => ({
        question: QA.question,
        candidateAnswer: "",
        referenceAnswer: QA.referenceAnswer,
      })) || [];
      
    console.log(QAwithRef);
    console.log("Job details:", job.title);

    const interview = new Interview({
      candidateId: candidate.id,
      candidateEmail: candidate.email,
      candidateName: candidate.name,
      jobId: job.id,
      jobTitle: job.title,
      deadline: deadline,
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
        deadline: savedInterview.deadline,
        totalQuestions: savedInterview.totalQuestions,
        status: savedInterview.interviewStatus,
      },
    });
  });

  addTranscriptToInterview = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { transcript } = req.body;
    const { interviewId } = req.params;

    const updatedUser = await Interview.findByIdAndUpdate(
      interviewId,
      { $set: {questionsAnswers: transcript} }, 
      { new: true, runValidators: true } 
    ).orFail();

    console.log(updatedUser);

    res.status(200).json({
        success: true,
        data: updatedUser
    });
  });

  

}

export const interviewController = new InterviewController();
