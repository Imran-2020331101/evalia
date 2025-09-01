import { 
  CreateJobRequestSchema, 
  JobFilterSchema, 
  ApiResponse, 
  Pagination,
  CreateJobRequest
} from '../types/job.types';
// Status enum for job applications
enum ApplicationStatus {
  Pending = 'PENDING',
  Shortlisted = 'SHORTLISTED',
  Rejected = 'REJECTED',
}
import { JobDetailsModel, IJobDetailsDocument } from '../models/JobDetails';
import { Types } from 'mongoose';
import { logger } from '../config/logger';
import { sendNotification } from '../utils/notify';
import { mapJobData } from '../utils/jobMapper';
import { ApplicationCompatibilityService } from './ApplicationCompatibilityService';

class jobService{
  
    async createJob(payload: CreateJobRequest): Promise<ApiResponse> {    

      try {
        
        const jobData  = mapJobData(payload);
        const savedJob = await new JobDetailsModel(jobData).save();

        if(savedJob){
          const notification = {
            userId   : savedJob.company.OrganizationId,
            type     : "job.posting.created",
            jobTitle : savedJob.title,
            jobId    : savedJob._id || "unknown"
          }
          sendNotification(notification,"notifications");
        }
        
        logger.info("New job created successfully", {
          jobId    : savedJob._id.toString(),
          company  : savedJob.company?.OrganizationId,
          postedBy : savedJob.postedBy,
        });

        return {
          success : true,
          message : "Job created successfully",
          data    : savedJob
        };
      } catch (error: any) {
        logger.error("Error creating job", { error: error.message, stack: error.stack });
        
        if (error.name === "ValidationError") {
          const validationErrors = Object.values(error.errors).map((err: any) => err.message);
          return {
            success : false,
            error   : "Validation failed",
            details : validationErrors,
          };
        }
        
        return {
          success : false,
          error   : "Internal server error while creating job",
        };
      }
    }

    async findJobById(jobId: string): Promise<IJobDetailsDocument | null> {
      if (!Types.ObjectId.isValid(jobId)) {
        logger.error("Invalid jobId provided", { jobId });
        throw new Error("Invalid job Id provided");
      }
      
      const job = await JobDetailsModel.findById(jobId).catch((e)=> {
        logger.error("Job not found", { jobId, error: e.message });
        throw new Error("Job not found")
      });
      
      // Best-effort view increment (don't fail the whole request if this fails)
      JobDetailsModel.findByIdAndUpdate(jobId, { $inc: { views: 1 } })
        .catch((e) => logger.warn("Failed to increment job views", { jobId, error: e.message }));
      
        logger.info("Job details retrieved", {
        jobId: job?._id?.toString(),
        views: (job?.views ?? 0) + 1,
      });
      
      return job;

    }

    async getJobsByCompany(organizationId: string, page: number = 1, limit: number = 10): Promise<{
      jobs: IJobDetailsDocument[];
      pagination: Pagination;
    }> {
      const query = { "company.OrganizationId": organizationId };
      const skip = (page - 1) * limit;

      const [jobs, totalCount] = await Promise.all([
        JobDetailsModel.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        JobDetailsModel.countDocuments(query),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      const pagination: Pagination = {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit,
      };

      logger.info("Jobs retrieved by company", {
        organizationId,
        jobsCount: jobs.length,
        totalCount,
        page,
        limit,
      });

      return { jobs, pagination };
    }


    async bulkJobDelete(OrganizationId: string): Promise<ApiResponse>{
      try {       
        const result = await JobDetailsModel.updateMany(
          { "organization.id": OrganizationId },
          { $set: { status: "DELETED" } }
        );

        logger.info("Bulk job status updated to DELETED", {
          organizationId: OrganizationId,
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount,
        });
        return {
          success: true,
          message: `All jobs for organization ${OrganizationId} marked as DELETED`,
          data: {
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
          },
        };
       } catch (error) {
        return {
          success: false,
          message: `failed to delete the jobs of the Organization :  ${OrganizationId}`,
        }
      }
    }

    async deleteJobByJobId(jobId: string) : Promise<{
      success: boolean,
      jobId: string,
      title: string
    }>{
      const deletedJob = await JobDetailsModel.findByIdAndDelete(jobId);

      if (!deletedJob) {
        throw new Error(`Job with ID ${jobId} not found`);
      }
      
      logger.info("Job deleted", {
        jobId: deletedJob._id.toString(),
        company: deletedJob.company.OrganizationId,
      });

      return {
        success: true,
        jobId: deletedJob._id.toString(),
        title: deletedJob.title
      };
    }

    async applyToJob(jobId: string, candidateEmail: string, candidateId: string): Promise<ApiResponse> {
      try {
        // Check if candidate already applied
        const existingJob = await JobDetailsModel.findById(jobId);
        if (!existingJob) {
          return { success: false, error: "Job not found" };
        }
        const alreadyApplied = existingJob.applications?.some(app => app.candidateEmail === candidateEmail);
        if (alreadyApplied) {
          return {
            success: false,
            error: "Candidate has already applied to this job",
          };
        }

        const application = {
          candidateEmail,
          candidateId,
          appliedAt : new Date(),
          status    : ApplicationStatus.Pending,
        };

        const job = await JobDetailsModel.findByIdAndUpdate(
          jobId,
          { $addToSet: { applications: application } },
          { new: true }
        );

        logger.info("Candidate applied to job", { jobId: job?._id.toString(), candidateEmail, });
        return {
          success: true,
          message: "Application submitted successfully",
          data: {
            jobId: job?._id,
            candidateEmail,
          },
        };
      } catch (error: any) {
        logger.error("Error applying to job", {
          error: error.message,
          jobId,
        });
        return {
          success: false,
          error: "Internal server error while applying to job",
        };
      }
    }

    async shortlistCandidate(jobId: string, candidateId: string): Promise<ApiResponse> {
      if (!Types.ObjectId.isValid(jobId)) {
        return { success: false, error: "Invalid job ID" };
      }
      if (!candidateId || typeof candidateId !== 'string') {
        return { success: false, error: "Candidate ID is required and must be a string." };
      }
      try {
        // Update the status of the candidate's application to 'shortlisted'
        const job = await JobDetailsModel.findOneAndUpdate(
          { _id: jobId, "applications.candidateId": candidateId },
          { $set: { "applications.$.status": ApplicationStatus.Shortlisted } },
          { new: true }
        );
        if (!job) {
          return { success: false, error: "Job or application not found" };
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
        };
      } catch (error: any) {
        logger.error("Error shortlisting candidate", {
          error: error.message,
          jobId,
        });
        return {
          success: false,
          error: "Internal server error while shortlisting candidate",
        };
      }
    }

    async bulkRejectApplications(jobId: string, currentStatus: string): Promise<ApiResponse> {
      if (!Types.ObjectId.isValid(jobId)) {
        return { success: false, error: "Invalid job ID" };
      }

      try {
        const job = await JobDetailsModel.findOne(
          { _id: jobId },
          { applications: 1, title: 1 }
        ).lean();
        if (!job) {
          return { success: false, error: "Job not found" };
        }
        const rejectedCandidates = job.applications.filter(app => app.status === currentStatus);
        const updatedCount = rejectedCandidates.length;

        await JobDetailsModel.updateOne(
          { _id: jobId },
          { $set: { "applications.$[elem].status": ApplicationStatus.Rejected } },
          { arrayFilters: [{ "elem.status": currentStatus }] }
        );

        // Post notification for each rejected candidate (async, don't wait)
        (async () => {
          try {
            for (const candidate of rejectedCandidates) {
              const compatibility_review = await ApplicationCompatibilityService.findCompatibilityReview(jobId , candidate.candidateEmail);
              const notification = {
                candidateName : candidate.candidateName,
                candidateEmail: candidate.candidateEmail,
                type          : "job.application.rejected",
                jobTitle      : job.title,
                jobId         : jobId,
                stage         : currentStatus,
                compatibility_review
              };
              sendNotification(notification, "email-notifications");
            }
          } catch (err) {
            logger.error("Error in async notification processing", { error: (err as Error).message, jobId });
          }
        })();

        logger.info(`Changed status to REJECTED for ${updatedCount} applications`, { jobId, updatedCount });

        return {
          success: true,
          message: `Rejected ${updatedCount} applications with status '${currentStatus}'`,
          data: { jobId, updatedCount },
        };
      } catch (error: any) {
        logger.error("Error rejecting candidates", { error: error.message, jobId });
        return { success: false, error: "Internal server error while rejecting candidates" };
      }
    }

    async findJobsByIds(jobIds: string[]): Promise<IJobDetailsDocument[]> {
      try {
        // Validate all job IDs
        const validJobIds = jobIds.filter(id => Types.ObjectId.isValid(id));
        
        if (validJobIds.length === 0) {
          logger.warn("No valid job IDs provided", { jobIds });
          return [];
        }

        // Find all jobs with the provided IDs
        const jobs = await JobDetailsModel.find({
          _id: { $in: validJobIds.map(id => new Types.ObjectId(id)) }
        }).lean();

        logger.info("Retrieved jobs by IDs", {
          requestedCount: jobIds.length,
          validCount: validJobIds.length,
          foundCount: jobs.length
        });

        return jobs;
      } catch (error: any) {
        logger.error("Error fetching jobs by IDs", { 
          error: error.message, 
          jobIds: jobIds.length 
        });
        throw new Error("Failed to fetch jobs by IDs");
      }
    }

    
}

export const JobService = new jobService();
