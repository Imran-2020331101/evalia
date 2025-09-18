import { Request, response, Response } from 'express';
import { JobDetailsModel, IJobDetailsDocument } from '../models/JobDetails';
import { logger } from '../config/logger';
import { 
  CreateJobRequestSchema, 
  JobFilterSchema, 
  ApiResponse, 
  Pagination,
  ApplicationStatus,
  InterviewQuestionsRequest,
  InterviewQuestionsGenerateSchema
} from '../types/job.types';
import { JobService } from '../services/jobService';
import { z } from 'zod';
import { ApplicationCompatibilityService } from '../services/ApplicationCompatibilityService';
import axios from 'axios';
import { ResumeDTO } from '../types/resume.types';
import { applicationService } from '../services/applicationService';
import { asyncHandler } from '../utils/asyncHandler';
import { ShortlistRequest } from '../types/aplication.types';




export class ApplicationController{
    
  /**
  * Apply for a job (add candidate information to job's applications)
  * @route POST /api/jobs/apply
  */
  applyToJob = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const schema = z.object({
      jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid job ID"),
      email: z.string().email("Invalid candidate email"),
      candidateId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid job ID"),
      candidateName: z.string().optional()
    });
    const { jobId, email, candidateId, candidateName } = schema.parse(req.body);
 
    const result = await applicationService.applyToJob(jobId, email, candidateId, candidateName || "No name found");
    if(result){
      (async () => {
        try {
          const resumeResponse = await axios.get(`${process.env.RESUME_SERVICE_URL}/api/resume/retrieve?email=${email}`);
          const resume: ResumeDTO = resumeResponse.data as ResumeDTO;
          const jobResult = await JobService.findJobById(jobId);
          if(jobResult){
            const review = await ApplicationCompatibilityService.evaluateCandidateProfile(jobResult, resume, email);
            if (review && review._id) {
              await JobService.addReviewIdToApplication(
                jobId, 
                review._id.toString(), 
                email
              );
            }
          } 
        } catch (err) {
          console.log("Error in async profile evaluation", { error: (err as Error).message, jobId, email });
          console.log(err);
        }
      })();
    }

    res.status(200).json({
      success : true,
      data    : result,
    });
  });

  /**
   * Revoke Application from a job (remove candidate info from job's application)
   * @route POST /api/jobs/withdraw
   */
  withDrawApplicationFromAJob = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const schema = z.object({
      jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid job ID"),
      email: z.string().email("Invalid candidate email"),
      candidateId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid candidate ID")
    });
    
    const { jobId, email, candidateId } = schema.parse(req.body);
    
    const result = await applicationService.withdrawApplication(jobId, email, candidateId);
    
    res.status(200).json({
      success : true,
      data    : result
    });
  });

  /**
   * Recieves an array of one or more candidateIds. All of them are marked as SHORTLISTED. 
   * @route POST /api/jobs/:jobId/shortlist
   */
  shortListCandidates = asyncHandler(async (req:Request,res:Response):Promise<void> => {
    const { candidates } = ShortlistRequest.parse(req.body);
    const { jobId } = req.params;

    logger.info(jobId);

    const result = await applicationService.shortlistCandidate(jobId, candidates);

    res.status(200).json({
      success: true,
      data   : result
    });
  });

  finalizeCandidates = asyncHandler(async (req: Request , res: Response): Promise<void> =>{
    const { candidates } = ShortlistRequest.parse(req.body);
    const { jobId } = req.params;

    logger.info(jobId);

    const result = await applicationService.finalizeCandidate(jobId, candidates);

    res.status(200).json({
      success: true,
      data   : result
    });
  })

  

  rejectRemainingCandidates = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { candidates } = ShortlistRequest.parse(req.body);
    const { jobId, status } = req.params;

    logger.info(jobId);

    const result = await applicationService.rejectCandidate(jobId, status, candidates);

    res.status(200).json({
      success: true,
      data   : result
    });
  });

  test = asyncHandler(async( req: Request, res: Response) : Promise<void> => {
    // Test data - replace with actual candidate and job data
    const testCandidates = [
      {
        candidateId: "60f1b2b8e1234567890abcde", // Replace with actual candidate ID
        candidateName: "John Doe",
        candidateEmail: "ajoadislam@gmail.com"
      },
      {
        candidateId: "60f1b2b8e1234567890abcdf", // Replace with actual candidate ID
        candidateName: "Jane Smith", 
        candidateEmail: "nazmulhossenrahul@gmail.com"
      }
    ];
    
    const testJobId = "68bdb2710feddd9cc58bb236"; 
    
    try {
      await applicationService.sendInterviewInvitation(testCandidates, testJobId);
      
      res.status(200).json({
        success: true,
        message: "Interview invitations sent successfully",
        data: {
          candidatesInvited: testCandidates.length,
          jobId: testJobId
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to send interview invitations",
        error: (error as Error).message
      });
    }
  });
  
}

export const applicationController = new ApplicationController();