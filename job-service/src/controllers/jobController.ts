import { Request, response, Response } from 'express';
import { JobDetailsModel, IJobDetailsDocument } from '../models/JobDetails';
import { logger } from '../config/logger';
import { 
  CreateJobRequestSchema, 
  JobFilterSchema, 
  ApiResponse, 
  Pagination,
  ApplicationStatus
} from '../types/job.types';
import { JobService } from '../services/jobService';
import { z } from 'zod';
import { ApplicationCompatibilityService } from '../services/ApplicationCompatibilityService';
import axios from 'axios';
import { ResumeDTO } from '../types/resume.types';

export class JobController {

  /**
   * Create a new job posting
   * @route POST /api/jobs
   */
  async createJob(req: Request, res: Response): Promise<void> {

    
    console.log(req.body)

    const validationResult = CreateJobRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      
      const errors = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      logger.warn("Validation failed", { errors });
      
      res.status(400).json( {
        success : false,
        error   : "Validation failed",
        details : errors,
      })

      return;
    }

    try {
      const result = await JobService.createJob(validationResult.data);
      const status = result.success ? 201 : (result.details || result.error === 'Validation failed') ? 400 : 500;

      res.status(status).json(result);
    } catch (error: any) {
      logger.error("Error creating job", { error: error.message, stack: error.stack });
      res.status(500).json({ success: false, error: "Internal server error while creating job" } as ApiResponse);
    }
  }

  /**
   * Get single job details by ID
   * @route GET /api/jobs/:jobId
   */
  async getJobById(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = z.object({ jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid job ID") }).parse(req.params);

      const result = await JobService.findJobById(jobId);
      res.status(200).json({
        success : false,
        data    : result
      });

    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: error.errors.map(e => e.message).join(", ") } as ApiResponse);
        return;
      }
      logger.error("Error fetching job details", { error: error.message, stack: error.stack });
      res.status(500).json({ success: false, error: "Internal server error while fetching job details", } as ApiResponse);
    }
  }

  /**
   * Get all the jobs posted by an Organization with pagination and filtering
   * @route GET /api/jobs/company/:companyName
   */
  async getAllJobsOfAnOrganization(req: Request, res: Response): Promise<void> {
    try {
      const { OrganizationId } = req.params;

      if (!OrganizationId) {
        res.status(400).json({
          success : false,
          error   : "Organization Id is required",
        } as ApiResponse);
        return;
      }

      const page  = parseInt(req.query.page as string)  || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { jobs, pagination } = await JobService.getJobsByCompany(OrganizationId, page, limit);

      res.json({
        success : true,
        message : `Jobs retrieved successfully for company ID: ${OrganizationId}`,
        data    : { jobs, pagination },
      } as ApiResponse);

    } catch (error: any) {
      res.status(500).json({
        success : false,
        error   : "Internal server error while fetching jobs",
      } as ApiResponse);
    }
  }

  async deleteAllJobsOfAnOrganization(req:Request, res: Response) : Promise<void> {
    try {
      const { OrganizationId } = req.params;
      if (!OrganizationId) {
        res.status(400).json({
          success : false,
          error   : "Organization Id is required",
        } as ApiResponse);
        return;
      }

      // Bulk update jobs to status 'DELETED'
      const result = await JobService.bulkJobDelete(OrganizationId);
      const status = result.success ? 201 : (result.details || result.error === 'Validation failed') ? 400 : 500;
      
      res.status(status).json(result);
    } catch (error: any) {
      
      logger.error("Error bulk deleting jobs for organization", {
        error          : error.message,
        organizationId : req.params.OrganizationId,
      });

      res.status(500).json({
        success : false,
        error   : "Internal server error while bulk deleting jobs",
      } as ApiResponse);
    }
  }

  /**
   * Get all jobs with pagination and filtering
   * @route GET /api/jobs
   */
  async getAllJobs(req: Request, res: Response): Promise<void> {
    try {
      const filterValidation = JobFilterSchema.safeParse(req.query);
      
      if (!filterValidation.success) {
        const errors = filterValidation.error.errors.map( err => `${err.path.join('.')}: ${err.message}`);
        res.status(400).json({
          success : false,
          error   : "Invalid query parameters",
          details : errors,
        } as ApiResponse);
        return;
      }

      const { page, limit, sortBy, sortOrder, status } = filterValidation.data;

      const query : any = {};
      if (status) {
        query.status = status;
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Execute query with pagination
      const [jobs, totalCount] = await Promise.all([
        JobDetailsModel.find(query)
          .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        JobDetailsModel.countDocuments(query),
      ]);

      const totalPages  = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const pagination: Pagination = {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit,
      };

      logger.info("All jobs retrieved", {jobsCount: jobs.length, totalCount, page, limit, });

      res.json({
        success : true,
        message : "Jobs retrieved successfully",
        data    : { jobs, pagination, },
      } as ApiResponse<{ jobs: IJobDetailsDocument[]; pagination: Pagination }>);

    } catch (error: any) {
      logger.error("Error fetching all jobs", {
        error: error.message,
      });

      res.status(500).json({
        success : false,
        error   : "Internal server error while fetching jobs",
      } as ApiResponse);
    }
  }

  /**
   * Update job status
   * @route PUT /api/jobs/:jobId/status
   */
  async updateJobStatus(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      const { status } = req.body;

      // Validate status
      const validStatuses = ['DRAFT', 'ACTIVE', 'FILLED', 'ARCHIVED', 'DELETED'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          error: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}`,
        } as ApiResponse);
        return;
      }

      const updatedJob = await JobDetailsModel.findByIdAndUpdate(
        jobId,
        { status },
        { new: true, runValidators: true }
      );

      if (!updatedJob) {
        res.status(404).json({
          success: false,
          error: "Job not found",
        } as ApiResponse);
        return;
      }

      logger.info("Job status updated", {
        jobId: updatedJob._id.toString(),
        newStatus: status,
      });

      res.json({
        success: true,
        message: "Job status updated successfully",
        data: {
          jobId: updatedJob._id,
          status: updatedJob.status,
        },
      } as ApiResponse);
    } catch (error: any) {
      logger.error("Error updating job status", {
        error: error.message,
        jobId: req.params.jobId,
      });

      res.status(500).json({
        success: false,
        error: "Internal server error while updating job status",
      } as ApiResponse);
    }
  }

  /**
   * Delete a job
   * @route DELETE /api/jobs/:jobId
   */
  async deleteJob(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      const result = await JobService.deleteJobByJobId(jobId);

      res.json({
        success: result.success,
        message: "Job deleted successfully",
        data: {
          jobId: result.jobId,
          title: result.title,
        },
      } as ApiResponse);
    } catch (error: any) {
      logger.error("Error deleting job", {
        error: error.message,
        jobId: req.params.jobId,
      });

      res.status(500).json({
        success: false,
        error: "Internal server error while deleting job",
      } as ApiResponse);
    }
  }

  /**
  * Apply for a job (add candidate email to job's applications)
  * @route POST /api/jobs/apply
  */
  async applyToJob(req: Request, res: Response): Promise<void> {
    try {
      
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
            const resumeResponse = await axios.post(`${process.env.RESUME_SERVICE_URL}/api/resume/retrive`,{ email });
            const resume: ResumeDTO = resumeResponse.data as ResumeDTO;
            const jobResult = await JobService.findJobById(jobId);
            jobResult && await ApplicationCompatibilityService.evaluateCandidateProfile(jobResult, resume, email);
          } catch (err) {
            logger.error("Error in async profile evaluation", { error: (err as Error).message, jobId, email });
          }
        })();
      }
      const status = result.success ? 200 : 400;
      res.status(status).json(result);


    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: error.errors.map(e => e.message).join(", ")
        } as ApiResponse);
        return;
      }
      logger.error("Error in applyToJob controller", {
        error: error.message,
        jobId: req.body.jobId,
      });
      res.status(500).json({
        success: false,
        error: "Internal server error while applying to job",
      } as ApiResponse);
    }
  }


  async withDrawApplicationFromAJob(req: Request, res: Response): Promise<void> {
    try {
      const schema = z.object({
        jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid job ID"),
        email: z.string().email("Invalid candidate email"),
        candidateId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid candidate ID")
      });
      
      const { jobId, email, candidateId } = schema.parse(req.body);
      
      const result = await JobService.withdrawApplication(jobId, email, candidateId);
      const status = result.success ? 200 : 400;
      
      res.status(status).json(result);

    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: error.errors.map(e => e.message).join(", ")
        } as ApiResponse);
        return;
      }
      
      logger.error("Error in withDrawApplicationFromAJob controller", {
        error: error.message,
        jobId: req.body.jobId,
      });
      
      res.status(500).json({
        success: false,
        error: "Internal server error while withdrawing application"
      } as ApiResponse);
    }
  }


  async shortListCandidate(req:Request,res:Response):Promise<void>{
    try {
      const schema = z.object({
        jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid job ID"),
        email: z.string().email("Invalid candidate email")
      });
      const { jobId, email } = schema.parse(req.body);
      const result = await JobService.shortlistCandidate(jobId, email);
      const status = result.success ? 200 : 400;
      res.status(status).json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: error.errors.map(e => e.message).join(", ")
        } as ApiResponse);
        return;
      }
      logger.error("Error in shortListCandidate controller", {
        error: error.message,
        jobId: req.body.jobId,
      });
      res.status(500).json({
        success: false,
        error: "Internal server error while shortlisting candidate",
      } as ApiResponse);
    }
  }

async rejectRemainingCandidates(req: Request, res: Response): Promise<void> {
  try {
    const { jobId, currentStatus } = req.body;

    if (!ApplicationStatus.options.includes(currentStatus)) {
      res.status(400).json({
        success : false,
        error   : "Invalid status type. You must include a valid current status of the candidates",
      } as ApiResponse);
      return ;
    }

    const result = await JobService.bulkRejectApplications(jobId, currentStatus);

    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);

  } catch (error: any) {
    logger.error("Error in rejectRemainingCandidates controller", {
      error : error.message,
      jobId : req.body.jobId,
    });

    res.status(500).json({
      success : false,
      error   : "Internal server error while rejecting candidates",
    } as ApiResponse);
  }
}


  async  getAllJobsAppliedByAUser(req: Request, res: Response): Promise<void>{
    try {

      const jobIdsSchema = z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid job ID format"))
        .min(1, "At least one job ID is required")
        .max(100, "Maximum 100 job IDs allowed per request");

      const validationResult = jobIdsSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors
        } as ApiResponse);
        return;
      }

      const jobIds = validationResult.data;

      logger.info("Fetching job details for applied jobs", { 
        jobIdsCount: jobIds.length,
        jobIds: jobIds 
      });

      // Fetch job details from database
      const jobDetails = await JobService.findJobsByIds(jobIds);

      logger.info("Successfully retrieved job details", {
        requestedCount: jobIds.length,
        foundCount: jobDetails.length
      });

      res.status(200).json({
        success: true,
        message: `Retrieved ${jobDetails.length} job details`,
        data: jobDetails
      } as ApiResponse);

    } catch (error: any) {
      logger.error("Error fetching applied jobs", {
        error: error.message,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        error: "Internal server error while fetching applied jobs"
      } as ApiResponse);
    }
  }

    async  getAllJobsSavedByAUser(req: Request, res: Response): Promise<void>{
    try {
      // Zod schema for validation
      const jobIdsSchema = z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid job ID format"))
        .min(1, "At least one job ID is required")
        .max(100, "Maximum 100 job IDs allowed per request");

      const validationResult = jobIdsSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors
        } as ApiResponse);
        return;
      }

      const jobIds = validationResult.data;

      logger.info("Fetching job details for saved jobs", { 
        jobIdsCount: jobIds.length,
        jobIds: jobIds 
      });

      // Fetch job details from database
      const jobDetails = await JobService.findJobsByIds(jobIds);

      logger.info("Successfully retrieved job details", {
        requestedCount: jobIds.length,
        foundCount: jobDetails.length
      });

      res.status(200).json({
        success: true,
        message: `Retrieved ${jobDetails.length} job details`,
        data: jobDetails
      } as ApiResponse);

    } catch (error: any) {
      logger.error("Error fetching saved jobs", {
        error: error.message,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        error: "Internal server error while fetching saved jobs"
      } as ApiResponse);
    }
  }
  
}

export const jobController = new JobController();
