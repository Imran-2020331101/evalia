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
  jobId: z.string(),
  jobTitle: z.string(),
  deadline: z.union([z.string(), z.date()]),
  totalQuestions: z.number(),
  status: InterviewStatusSchema,
});


export type InterviewCreatedNotification = z.infer<
  typeof InterviewCreatedNotificationSchema
>;
