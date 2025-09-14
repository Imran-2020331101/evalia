import { 
  CreateJobRequestSchema, 
  JobFilterSchema, 
  ApiResponse, 
  Pagination,
  CreateJobRequest
} from '../types/job.types';
// Status enum for job applications
import { JobDetailsModel, IJobDetailsDocument } from '../models/JobDetails';
import { Document, Types, UpdateResult } from 'mongoose';
import { logger } from '../config/logger';
import { sendNotification } from '../utils/notify';
import { mapJobData } from '../utils/jobMapper';
import { ApplicationCompatibilityService } from './ApplicationCompatibilityService';
import { EventTypes } from '../types/notifications.types';
import parseJobDescriptionPrompt, { JobDescriptionResult } from '../prompts/parseJobDescriptionprompt';
import upskillBot from '../config/OpenRouter';
import { JobEmbeddingResult, openAIService } from './OpenAIService';
import { qdrantService, SearchResult } from './QdrantService';


enum ApplicationStatus {
  Pending = 'PENDING',
  Shortlisted = 'SHORTLISTED',
  Rejected = 'REJECTED',
}

export interface JobMatchingScore {
  jobId : any;
  industry : any;
  isActive  : any;
  skills: number | null;
  education: number | null;
  experience: number | null;
  projects: number | null;
}


class jobService{
  
    async createJob(payload: CreateJobRequest): Promise<IJobDetailsDocument> {    

        const jobData    = mapJobData(payload);
        const savedJob   = await new JobDetailsModel(jobData).save();

        logger.info("New job created successfully", {
          jobId    : savedJob._id.toString(),
          company  : savedJob.company?.OrganizationId,
          postedBy : savedJob.postedBy,
        });

        return savedJob;
    }

    async findJobById(jobId: string): Promise<IJobDetailsDocument> {

      const job = await JobDetailsModel.findById(jobId).orFail();
      
      // Best-effort view increment (don't fail the whole request if this fails)
      JobDetailsModel.findByIdAndUpdate(jobId, { $inc: { views: 1 } })
        .orFail();
      
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


    async bulkJobDelete(OrganizationId: string): Promise<UpdateResult>{
     
        return await JobDetailsModel.updateMany(
          { "organization.id": OrganizationId },
          { $set: { status: "DELETED" } }
        ).orFail();

    }

    async deleteJobByJobId(jobId: string) : Promise<IJobDetailsDocument>{
      return await JobDetailsModel.findByIdAndDelete(jobId).orFail();
    }
   

    async bulkRejectApplications(jobId: string, currentStatus: string): Promise<ApiResponse> {
      if (!Types.ObjectId.isValid(jobId)) {
        return { success: false, error: "Invalid job ID" };
      }

      try {
        const job = await JobDetailsModel.findOne(
          { _id: jobId },
          { applications: 1, title: 1 }
        ).orFail();
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

        const validJobIds = jobIds.filter(id => Types.ObjectId.isValid(id));
        
        const jobs = await JobDetailsModel.find({
          _id: { $in: validJobIds.map(id => new Types.ObjectId(id)) }
        });

        logger.info("Retrieved jobs by IDs", {
          requestedCount: jobIds.length,
          validCount: validJobIds.length,
          foundCount: jobs.length
        });

        return jobs;
    }

    async addReviewIdToApplication(jobId: string, reviewId: string , email: string): Promise<void>{
      try {
        // Validate job ID
        if (!Types.ObjectId.isValid(jobId)) {
          logger.error("Invalid job ID format while adding review to applcation");
          throw new Error("Invalid job ID format");
        }
        
        // Validate email format
        if (!email || typeof email !== 'string' || !email.includes('@')) {
          logger.error("Invalid email format while adding review to application");
          throw new Error("Invalid email format");
        }

        // Update the specific application with the review ID using candidateEmail
        const result = await JobDetailsModel.updateOne(
          { 
            _id: jobId,
            "applications.candidateEmail": email
          },
          { 
            $set: { "applications.$.reviewId": reviewId } 
          }
        );

        console.log(result);

        if (result.matchedCount === 0) {
          throw new Error("Job or application not found for the given email while adding review to applcation");
        }

        if (result.modifiedCount === 0) {
          logger.warn("No application was modified", { jobId, email, reviewId });
        } else {
          logger.info("Review ID added to application successfully", { 
            jobId, 
            email, 
            reviewId 
          });
        }

      } catch (error: any) {
        logger.error("Error adding review ID to application", {
          error: error.message,
          jobId,
          email,
          reviewId
        });
        throw error;
      }
    }

    async fetchInterviewQuestions(jobId: string): Promise<string[] | undefined>{

        const jobData = await JobDetailsModel.findOne(
          { _id: jobId }, 
          'interviewQA'
        ).orFail();

        const interviewQues = jobData.interviewQA?.map((QA)=>QA.question);    
        console.log("Interview Questions:", interviewQues);
        
        return interviewQues;
    }

    async fetchJobDescription(jobId : string) : Promise<string | null | undefined> {
      const job = await JobDetailsModel.findOne({_id: jobId},'jobDescription');
      return job?.jobDescription;
    }
    
    async uploadJobToVectorDB(job : IJobDetailsDocument) : Promise<void> {
      const prompt : string = parseJobDescriptionPrompt([
              job.jobDescription,
              ...job.requirements.map((req) => req.description),
              ...job.responsibilities.map((res) => res.description),
                ...job.skills.map((skill) => skill.description),
              ].join(" ")
            );
      const res    : string = await upskillBot(prompt);

      const requirement           : JobDescriptionResult = JSON.parse(res);
      const requirementEmbeddings : JobEmbeddingResult[] = await  openAIService.createJobEmbedding(requirement.skills, requirement.experience, requirement.projects, requirement.education);
      
      await qdrantService.uploadJobToQdrant(requirementEmbeddings, {
        id: job._id.toString(),
        industry: requirement.industry,
        organizationId: job.company.OrganizationId,
      });

    }

  parseJobScores(data: SearchResult[]): JobMatchingScore[] {
    const jobsMap = new Map<string, JobMatchingScore>();

    for (const sectionData of data) {
      const sectionName = sectionData.section;
      const points = sectionData.result.points;

      for (const point of points) {
        const jobId = point.payload?.["document-id"];
        const score = point.score;

        // Skip if jobId is missing or invalid
        if (!jobId || typeof jobId !== "string") continue;

        // If job doesn't exist yet, initialize with defaults
        if (!jobsMap.has(jobId)) {
          jobsMap.set(jobId, {
            jobId: jobId,
            skills: null,
            education: null,
            experience: null,
            projects: null,
            industry: point.payload?.industry ?? null,
            isActive: point.payload?.is_active ?? null,
          });
        }

        // Retrieve job
        const jobScore = jobsMap.get(jobId)!;

        // Assign score based on section
        switch (sectionName) {
          case "skills":
            jobScore.skills = parseFloat(score.toFixed(2));
            break;
          case "education":
            jobScore.education = parseFloat(score.toFixed(2));
            break;
          case "experience":
            jobScore.experience = parseFloat(score.toFixed(2));
            break;
          case "projects":
            jobScore.projects = parseFloat(score.toFixed(2));
            break;
        }
      }
    }

    return Array.from(jobsMap.values());
  }
}

export const JobService = new jobService();
