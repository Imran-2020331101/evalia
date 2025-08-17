import { Request, Response } from 'express';
import { JobDetailsModel, IJobDetailsDocument } from '../models/JobDetails';
import { logger } from '../config/logger';

import { 
  CreateJobRequestSchema, 
  JobFilterSchema, 
  ApiResponse, 
  Pagination
} from '../types/job.types';
import { JobService } from '../services/jobService';
import { z } from 'zod';

export class JobController {
  /**
   * Create a new job posting
   * @route POST /api/jobs
   */
  async createJob(req: Request, res: Response): Promise<void> {
    try {
      console.log(req.body);
      const result = await JobService.createJob(req.body);
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
      const status = result.success ? 200 : (result.details || result.error === 'Validation failed') ? 400 : 500;
      res.status(status).json(result);

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
   * Get all jobs by company name with pagination and filtering
   * @route GET /api/jobs/company/:companyName
   */
  async getJobsByCompany(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;

      if (!companyId) {
        res.status(400).json({
          success: false,
          error: "Company Id is required",
        } as ApiResponse);
        return;
      }

      // Simple pagination from query params with defaults
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Build query with only company ID
      const query = {
        "company.id": companyId,
      };

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Execute query with pagination and sort by creation date (newest first)
      const [jobs, totalCount] = await Promise.all([
        JobDetailsModel.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        JobDetailsModel.countDocuments(query),
      ]);

      const totalPages = Math.ceil(totalCount / limit);
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

      logger.info("Jobs retrieved by company", {
        companyId,
        jobsCount: jobs.length,
        totalCount,
        page,
        limit,
      });

      res.json({
        success: true,
        message: `Jobs retrieved successfully for company ID: ${companyId}`,
        data: {
          jobs,
          pagination,
        },
      } as ApiResponse<{ jobs: IJobDetailsDocument[]; pagination: Pagination }>);
    } catch (error: any) {
      logger.error("Error fetching jobs by company", {
        error: error.message,
        companyId: req.params.companyId,
      });

      res.status(500).json({
        success: false,
        error: "Internal server error while fetching jobs",
      } as ApiResponse);
    }
  }

  /**
   * Get all jobs with pagination and filtering
   * @route GET /api/jobs
   */
  async getAllJobs(req: Request, res: Response): Promise<void> {
    try {
      // Validate query parameters
      const filterValidation = JobFilterSchema.safeParse(req.query);
      if (!filterValidation.success) {
        const errors = filterValidation.error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        res.status(400).json({
          success: false,
          error: "Invalid query parameters",
          details: errors,
        } as ApiResponse);
        return;
      }

      const { page, limit, sortBy, sortOrder, status } = filterValidation.data;

      // Build query
      const query: any = {};
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

      const totalPages = Math.ceil(totalCount / limit);
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

      logger.info("All jobs retrieved", {
        jobsCount: jobs.length,
        totalCount,
        page,
        limit,
      });

      res.json({
        success: true,
        message: "Jobs retrieved successfully",
        data: {
          jobs,
          pagination,
        },
      } as ApiResponse<{ jobs: IJobDetailsDocument[]; pagination: Pagination }>);
    } catch (error: any) {
      logger.error("Error fetching all jobs", {
        error: error.message,
      });

      res.status(500).json({
        success: false,
        error: "Internal server error while fetching jobs",
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
      const validStatuses = ['draft', 'active', 'paused', 'closed', 'filled'];
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

      const deletedJob = await JobDetailsModel.findByIdAndDelete(jobId);

      if (!deletedJob) {
        res.status(404).json({
          success: false,
          error: "Job not found",
        } as ApiResponse);
        return;
      }

      logger.info("Job deleted", {
        jobId: deletedJob._id.toString(),
        company: deletedJob.company.id,
      });

      res.json({
        success: true,
        message: "Job deleted successfully",
        data: {
          jobId: deletedJob._id,
          title: deletedJob.id,
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
  * @route POST /api/jobs/:jobId/apply
  */
  async applyToJob(req: Request, res: Response): Promise<void> {
    try {
      const { jobId, email } = req.body;
      const result = await JobService.applyToJob(jobId, email);
      const status = result.success ? 200 : 400;
      res.status(status).json(result);
    } catch (error: any) {
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

  async shortListCandidate(req:Request,res:Response):Promise<void>{
    try {
      const { jobId, email } = req.body;
      const result = await JobService.shortlistCandidate(jobId, email);
      const status = result.success ? 200 : 400;
      res.status(status).json(result);
    } catch (error: any) {
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

  
}

export const jobController = new JobController();
