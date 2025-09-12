import { Request, Response } from 'express';
import { JobDetailsModel, IJobDetailsDocument } from '../models/JobDetails';
import { logger } from '../config/logger';
import { 
  CreateJobRequestSchema, 
  JobFilterSchema, 
  ApiResponse, 
  Pagination,
  InterviewQuestionsGenerateSchema
} from '../types/job.types';
import { JobService } from '../services/jobService';
import { z } from 'zod';
import questionGenerationPrompt from '../prompts/QuestionGenerationPromt';
import upskillBot from '../config/OpenRouter';
import { asyncHandler } from '../utils';

export class JobController {

  /**
   * Create a new job posting
   * @route POST /api/jobs
   */
  createJob = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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

    const result = await JobService.createJob(validationResult.data);
    

    res.status(200).json({
      success : true,
      data    : result,
    });
  });

  /**
   * Get single job details by ID
   * @route GET /api/jobs/:jobId
   */
  getJobById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { jobId } = z.object({ jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid job ID") }).parse(req.params);

    const result = await JobService.findJobById(jobId);
    res.status(200).json({
      success : true,
      data    : result
    });
  });

  /**
   * Get all the jobs posted by an Organization with pagination and filtering
   * @route GET /api/jobs/company/:companyName
   */
  getAllJobsOfAnOrganization = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
  });

  deleteAllJobsOfAnOrganization= asyncHandler(async (req:Request, res: Response) : Promise<void> => {
      const { OrganizationId } = req.params;
      if (!OrganizationId) {
        res.status(400).json({
          success : false,
          error   : "Organization Id is required",
        } as ApiResponse);
        return;
      }

      const result = await JobService.bulkJobDelete(OrganizationId);
      
      res.status(200).json({
        success : true,
        data    : result
      });
  });

  /**
   * Get all jobs with pagination and filtering
   * @route GET /api/jobs
   */
  getAllJobs = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
  });

  /**
   * Update job status
   * @route PUT /api/jobs/:jobId/status
   */
  updateJobStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
      ).orFail();

      res.json({
        success: true,
        message: "Job status updated successfully",
        data: {
          jobId: updatedJob._id,
          status: updatedJob.status,
        },
      } as ApiResponse);
  });

  /**
   * Delete a job
   * @route DELETE /api/jobs/:jobId
   */
  deleteJob = asyncHandler(async (req: Request, res: Response): Promise<void> => {

      const { jobId } = req.params;
      const result = await JobService.deleteJobByJobId(jobId);

      res.json({
        success: true,
        message: "Job deleted successfully",
        data: result,
      } as ApiResponse);

  })

  fetchBatchJobInfo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
  });

  getAllJobsSavedByAUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const jobIdsSchema = z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid job ID format"))
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
  });


  getInterviewQuestionsOfAJob = asyncHandler(async (req: Request, res:Response) : Promise<void> => {
    const {jobId} = req.params;
    const interviewQA = await JobService.fetchInterviewQuestions(jobId);
    res.status(200).json({
      success : true,
      message : `Retrieved ${interviewQA?.length} Questions for interview`,
      data    : interviewQA 
    })
  })
  

  getDescriptionOfAJob = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { jobId } = req.params;
    console.log(jobId);
    const description = await JobService.fetchJobDescription(jobId);

    res.status(200).json({
      success: true,
      message: `Retrieved Job Description`,
      data: description
    });
  });

  generateInterviewQuestions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    console.log("Interview Generation Request recieved ", req.body);
    const validationResult = InterviewQuestionsGenerateSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      logger.error(errors);
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors
      } as ApiResponse);
      return;
    }
    const {jobDescription, responsibilities, requirements, skills} = validationResult.data;

    const prompt = questionGenerationPrompt( jobDescription , responsibilities, requirements, skills);

    const Questions : string = await upskillBot(prompt);
    
    let cleaned = typeof Questions === "string"
      ? Questions
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/```$/, "")
          .trim()
      : Questions;

    let parsedQuestions = JSON.parse(cleaned);

    logger.info("Generated Questions : ", { parsedQuestions });

    res.status(200).json({
      success: true,
      data: parsedQuestions
    });
  });
}

export const jobController = new JobController();
