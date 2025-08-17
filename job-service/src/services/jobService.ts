import { 
  CreateJobRequestSchema, 
  JobFilterSchema, 
  ApiResponse, 
  Pagination
} from '../types/job.types';
import { JobDetailsModel, IJobDetailsDocument } from '../models/JobDetails';
import { Types } from 'mongoose';
import { logger } from '../config/logger';
import { sendNotification } from '../utils/notify';

class jobService{
    async applyToJob(jobId: string, candidateId: string, resumeId?: string): Promise<ApiResponse> {
      try {
        if (!Types.ObjectId.isValid(jobId)) {
          return { success: false, error: "Invalid job ID" } as ApiResponse;
        }
        if (!candidateId || typeof candidateId !== 'string') {
          return { success: false, error: "Candidate ID is required. (Must be a String)" } as ApiResponse;
        }

        // Build application object matching schema
        const application = {
          candidateId,
          appliedAt: new Date(),
          status: 'pending',
          ...(resumeId ? { resumeId } : {})
        };

        const job = await JobDetailsModel.findByIdAndUpdate(
          jobId,
          { $addToSet: { applications: application } },
          { new: true }
        );

        if (!job) {
          return { success: false, error: "Job not found" } as ApiResponse;
        }

        logger.info("Candidate applied to job", {
          jobId: job._id.toString(),
          candidateId,
        });

        return {
          success: true,
          message: "Application submitted successfully",
          data: {
            jobId: job._id,
            candidateId,
          },
        } as ApiResponse;
      } catch (error: any) {
        logger.error("Error applying to job", {
          error: error.message,
          jobId,
        });
        return {
          success: false,
          error: "Internal server error while applying to job",
        } as ApiResponse;
      }
    }
    async createJob(payload: unknown): Promise<ApiResponse> {
      try {
        const validationResult = CreateJobRequestSchema.safeParse(payload);
        if (!validationResult.success) {
          const errors = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
          console.log("Validation failed" , errors);
          return {
            success: false,
            error: "Validation failed",
            details: errors,
          } as ApiResponse;
        }

        const {
          companyInfo,
          basic: {
            title,
            jobDescription,
            jobLocation,
            salaryFrom,
            salaryTo,
            deadline,
            jobType,
            workPlaceType,
            employmentLevelType,
          },
          requirement,
          responsibility,
          skill,
          interviewQA,
        } = validationResult.data;
        
        console.log("Deadline received:", deadline);
        const jobData = {
          title,
          jobDescription,
          jobLocation,
          salary: { from: salaryFrom, to: salaryTo },
          deadline: new Date(deadline),
          jobType,
          workPlaceType,
          employmentLevel: employmentLevelType,
          requirements: requirement,
          responsibilities: responsibility,
          skills: skill,
          postedBy: companyInfo.id, // Using company ID as postedBy for now
          company: { id: companyInfo.id },
          status: "active" as const,
          interviewQA: interviewQA || [],
        };


        const newJob = new JobDetailsModel(jobData);
        const savedJob = await newJob.save();

        if(savedJob){
          const notification = {
            userId: companyInfo.id,
            type: "job.posting.created",
            jobTitle: title,
            jobId: savedJob._id || "unknown"
          }
          sendNotification(notification,"notifications");
        }


        logger.info("New job created successfully", {
          jobId: savedJob._id.toString(),
          company: savedJob.company?.id,
          postedBy: savedJob.postedBy,
        });

        return {
          success: true,
          message: "Job created successfully",
          data: {
            jobId: savedJob._id,
            company: savedJob.company?.id,
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

    

    async shortlistCandidate(jobId: string, candidateId: string): Promise<ApiResponse> {
      try {
        if (!Types.ObjectId.isValid(jobId)) {
          return { success: false, error: "Invalid job ID" } as ApiResponse;
        }
        if (!candidateId || typeof candidateId !== 'string') {
          return { success: false, error: "Candidate ID is required and must be a string." } as ApiResponse;
        }

        // Update the status of the candidate's application to 'shortlisted'
        const job = await JobDetailsModel.findOneAndUpdate(
          { _id: jobId, "applications.candidateId": candidateId },
          { $set: { "applications.$.status": "shortlisted" } },
          { new: true }
        );

        if (!job) {
          return { success: false, error: "Job or application not found" } as ApiResponse;
        }

        logger.info("Candidate application status updated to shortlisted", {
          jobId: job._id.toString(),
          candidateId,
        });

        return {
          success: true,
          message: "Candidate shortlisted successfully",
          data: {
            jobId: job._id,
            candidateId,
          },
        } as ApiResponse;
      } catch (error: any) {
        logger.error("Error shortlisting candidate", {
          error: error.message,
          jobId,
        });
        return {
          success: false,
          error: "Internal server error while shortlisting candidate",
        } as ApiResponse;
      }
    }
    
}

export const JobService = new jobService();
