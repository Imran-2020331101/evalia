export enum EventTypes{

  INTERVIEW_SCHEDULED = "interview.scheduled",
  INTERVIEW_CANCELLED = "interview.cancelled",
  ASSIGNMENT_CREATED = "assignment.created",
  ASSIGNMENT_GRADED = "assignment.graded",
  
}

import { z } from "zod";

export const InterviewStatusSchema = z.enum([
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
]);

export const InterviewCreatedNotificationSchema = z.object({
  type: z.string(),
  interviewId: z.string(),
  candidateId: z.string(),
  candidateEmail: z.string(),
  jobId: z.string(),
  jobTitle: z.string(),
  organizationId: z.string(),
  deadline: z.union([z.string(), z.date()]),
  totalQuestions: z.number(),
  status: InterviewStatusSchema,
}).loose();

export type InterviewCreatedNotification = z.infer<
  typeof InterviewCreatedNotificationSchema
>;

