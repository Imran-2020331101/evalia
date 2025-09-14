import { Request, Response } from 'express';
import { Interview, QAwithReference } from '../models/InterviewSchema';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError, NotFoundError } from '../errors';
import { interviewService } from '../services/InterviewService';
import { sendNotification } from '../utils/notify';
import { 
  IScheduleInterviewRequest, 
  IScheduleInterviewResponse, 
  IJobResponse,
  IQuestionAnswer,
  ScheduleInterviewRequest
} from '../types/interview.types';
import { EventTypes, InterviewCreatedNotification } from '../types/notification.types';
import { TranscriptQA } from '../prompts/transcript.mapper.prompt';

export class InterviewController {

  scheduleInterview = asyncHandler(async (req: Request, res: Response): Promise<void> => {

    console.log(req.body.job.interviewQA[0]);

    const validationResult = ScheduleInterviewRequest.safeParse(req.body);
    if(!validationResult.success){
      throw new BadRequestError(`Validation failed: ${validationResult.error.issues.map(issue => issue.message).join(', ')}`);
    }

    const interviewData = validationResult.data;    
    const createdInterview = await interviewService.createNewInterview(interviewData);

    const notification : InterviewCreatedNotification = {
      type          : EventTypes.INTERVIEW_SCHEDULED,
      interviewId   : createdInterview.interviewId,
      candidateId   : createdInterview.candidateId,
      candidateEmail: createdInterview.candidateEmail,
      jobId         : createdInterview.jobId,
      jobTitle      : createdInterview.jobTitle,
      organizationId: createdInterview.organizationId,
      deadline      : createdInterview.deadline,
      totalQuestions: createdInterview.totalQuestions,
      status        : createdInterview.status
    }
    sendNotification(notification, "notifications");

    res.status(201).json({
      success : true,
      message : "Interview scheduled successfully",
      data    : createdInterview,
    });
  });

  addTranscriptToInterview = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { transcript } = req.body;
    const { interviewId } = req.params;
    console.log(req.body);
    const interview = await Interview.findById(interviewId).orFail();
    
    const transcriptQA : TranscriptQA[] = await interviewService.mapTranscriptToQA(transcript, interview.questionsAnswers);

    console.log("LLM Response of the QA : ", transcriptQA);
    

    const updatedQA = interview.questionsAnswers.map((qa, index) => {
      const matchingTranscriptQA = transcriptQA.find(tqa => tqa.question === qa.question);
      return {
        question: qa.question,
        candidateAnswer: matchingTranscriptQA?.candidateAnswer || qa.candidateAnswer,
        referenceAnswer: qa.referenceAnswer,
        score: qa.score,
        feedback: qa.feedback,
        duration: qa.duration,
        answeredAt: matchingTranscriptQA?.candidateAnswer ? new Date() : qa.answeredAt
      };
    });

    // Update the interview in the database
    const updatedInterview = await Interview.findByIdAndUpdate(
      interviewId,
      { questionsAnswers: updatedQA },
      { new: true }
    ).orFail();

    interviewService.generateInterviewEvaluation(updatedQA, interview.integrityScore)

    res.status(200).json({
        success : true,
        data    : updatedInterview
    });
  });

  getAllInterviewsOfAUser = asyncHandler(async (req: Request, res: Response): Promise<void> =>{
    const { userId } = req.params;
    const interviews = await interviewService.getAllInterviewsOfAUser(userId);
    
    res.status(200).json({
      success : true,
      message : "Interviews retrieved successfully",
      data    : interviews
    });
  })
  
  getInterviewDetails = asyncHandler(async( req: Request, res: Response ) : Promise<void> => {
    const { interviewId } = req.params;
    const interview = await interviewService.getInterviewById( interviewId );

    res.status(200).json({
      success: true,
      data   : interview
    })
  })

  getSummaryOfAnInterview = asyncHandler(async( req: Request, res: Response) => {
    const { interviewId } = req.params;
    const summary = await interviewService.fetchSummaryById( interviewId );

    res.status(200).json({
      success: true,
      date   : summary
    })
  })

  getEvaluationByInterviewId = asyncHandler(async(req: Request, res: Response) =>{
    const { interviewId } = req.body;
    interviewService.fetchEvaluationByInterviewId( interviewId );
  })

}

export const interviewController = new InterviewController();
