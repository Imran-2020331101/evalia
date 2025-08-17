import { z } from "zod";


export enum JobTypes{
    JOB_POSTING_CREATED = "job.posting.created",
    JOB_MATCH_FOUND = "job.match.found",
    JOB_APPLICATION_SHORTLISTED = "job.application.shortlisted",
    JOB_APPLICATION_REJECTED = "job.application.rejected",
    JOB_APPLICATION_ACCEPTED = "job.application.accepted",
    CAREER_RECOMMENDATION_GENERATED = "career.recommendation.generated",
}


export const NotificationSchema = z.object({
  userId: z.string(),
  title: z.string(),
  message: z.string(),
  type: z.string(),
  link: z.string().optional(),
  isRead: z.boolean(),
  createdAt: z.date(),
}).passthrough();

export type INotification = z.infer<typeof NotificationSchema>;
