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




export class ApplicationController{
    
    /**
  * Apply for a job (add candidate information to job's applications)
  * @route POST /api/jobs/apply
  */
  applyToJob = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const schema = z.object({
      jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid job ID"),
      email: z.string().email("Invalid candidate email"),
      candidateId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid job ID")
    });
    const { jobId, email, candidateId } = schema.parse(req.body);
 
    const result = await JobService.applyToJob(jobId, email, candidateId);
    if(result.success){
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
    const status = result.success ? 200 : 400;
    res.status(status).json(result);
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
    
    const result = await JobService.withdrawApplication(jobId, email, candidateId);
    const status = result.success ? 200 : 400;
    
    res.status(status).json(result);
  });

  /**
   * Recieves an array of one or more candidateIds. All of them are marked as SHORTLISTED. 
   * @route POST /api/jobs/:jobId/shortlist
   */
  shortListCandidates = asyncHandler(async (req:Request,res:Response):Promise<void> => {
    const schema = z.object({
      candidateIds : z.array(z.string())
    }).passthrough();

    const { candidateIds } = schema.parse(req.body);
    const { jobId } = req.params;

    const result = await applicationService.shortlistCandidate(jobId, candidateIds);

    res.status(200).json({
      success: true,
      data   : result
    });
  });
}

export const applicationController = new ApplicationController();