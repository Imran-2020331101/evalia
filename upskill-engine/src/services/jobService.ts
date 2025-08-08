import { 
  CreateJobRequestSchema, 
  JobFilterSchema, 
  ApiResponse, 
  Pagination
} from '../types/job.types';
import { JobDetailsModel, IJobDetailsDocument } from '../models/JobDetails';
import { Types } from 'mongoose';
import { logger } from '../config/logger';

class jobService{
    async createJob(payload: unknown): Promise<ApiResponse> {
      try {
        const validationResult = CreateJobRequestSchema.safeParse(payload);
        if (!validationResult.success) {
          const errors = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
          return {
            success: false,
            error: "Validation failed",
            details: errors,
          } as ApiResponse;
        }

        const {
          title,
          jobDescription,
          jobLocation,
          salaryFrom,
          salaryTo,
          deadline,
          jobType,
          workPlaceType,
          employmentLevel,
          requirements,
          responsibilities,
          skills,
          postedBy,
          company,
        } = validationResult.data;

        const jobData = {
          title,
          jobDescription,
          jobLocation,
          salary: { from: salaryFrom, to: salaryTo },
          deadline,
          jobType,
          workPlaceType,
          employmentLevel,
          requirements,
          responsibilities,
          skills,
          postedBy,
          company,
          status: "active" as const,
        };

        const newJob = new JobDetailsModel(jobData);
        const savedJob = await newJob.save();

        logger.info("New job created successfully", {
          jobId: savedJob._id.toString(),
          title: savedJob.title,
          company: savedJob.company?.name,
          postedBy: savedJob.postedBy,
        });

        return {
          success: true,
          message: "Job created successfully",
          data: {
            jobId: savedJob._id,
            title: savedJob.title,
            company: savedJob.company?.name,
            status: savedJob.status,
            createdAt: savedJob.createdAt,
          },
        } as ApiResponse;
      } catch (error: any) {
        logger.error("Error creating job", { error: error.message, stack: error.stack });

        if (error.name === "ValidationError") {
          const validationErrors = Object.values(error.errors).map((err: any) => err.message);
          return {
            success: false,
            error: "Validation failed",
            details: validationErrors,
          } as ApiResponse;
        }

        return {
          success: false,
          error: "Internal server error while creating job",
        } as ApiResponse;
      }
    }

    async findJobById(jobId: string): Promise<ApiResponse> {
      try {
        // Validate ObjectId to avoid CastError
        if (!Types.ObjectId.isValid(jobId)) {
          return { success: false, error: "Invalid job ID" } as ApiResponse;
        }

        const job = await JobDetailsModel.findById(jobId);
        if (!job) {
          return { success: false, error: "Job not found" } as ApiResponse;
        }

        // Best-effort view increment (don't fail the whole request if this fails)
        JobDetailsModel.findByIdAndUpdate(jobId, { $inc: { views: 1 } })
          .catch((e) => logger.warn("Failed to increment job views", { jobId, error: e.message }));

        logger.info("Job details retrieved", {
          jobId: job._id.toString(),
          title: job.title,
          views: (job.views ?? 0) + 1,
        });

        return {
          success: true,
          message: "Job details retrieved successfully",
          data: job,
        } as ApiResponse<IJobDetailsDocument>;
      } catch (error: any) {
        logger.error("Error fetching job details", { jobId, error: error.message, stack: error.stack });
        return { success: false, error: "Internal server error while fetching job details" } as ApiResponse;
      }
    }
}

export const JobService = new jobService();
