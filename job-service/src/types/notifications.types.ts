import { z } from "zod";


export enum EventTypes{
  // For candidates
  JOB_POSTING_CREATED = "job.posting.created",
  JOB_MATCH_FOUND = "job.match.found",
  JOB_APPLICATION_SHORTLISTED = "job.application.shortlisted",
  JOB_APPLICATION_REJECTED = "job.application.rejected",
  JOB_APPLICATION_ACCEPTED = "job.application.accepted",
  CAREER_RECOMMENDATION_GENERATED = "career.recommendation.generated",

  // For Recruiter
  NEW_JOB_APPLICATION = "new.job.application",
  JOB_POSTING_EXPIRED = "job.posting.expired",  
  CANDIDATE_WITHDRAWN_APPLICATION = "candidate.withdrawn",
  
}



export const NotificationZodSchema = z.object({
  recieverId: z.string(),
  recieverEmail: z.string().email(),
  title: z.string(),
  message: z.string(),
  type: z.string(),
  link: z.string().optional(),
  isRead: z.boolean().default(false).optional(),
  createdAt: z.date().default(() => new Date()).optional(),
  data: z.any().optional(),
}).passthrough();


export type INotification = z.infer<typeof NotificationZodSchema>;

