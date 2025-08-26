import { z } from 'zod';

export const NotificationPayloadSchema = z.object({
  candidateName: z.string(),
  candidateEmail: z.string().email(),
  type: z.string(),
  jobTitle: z.string(),
  jobId: z.string(),
  stage: z.string(),
  compatibilityReview: z.object({
    matchPercentage: z.number().min(0).max(100),
    fit: z.enum(['Best Fit', 'Good Fit', 'Average', 'Bad Fit']),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
  }),
}).loose();

export const InterviewInvitationPayloadSchema = z.object({
  candidateName: z.string(),
  candidateEmail: z.email(),
  jobTitle: z.string(),
  OrganizationName: z.string(),
  deadline: z.string(),
  interviewLink: z.url(),
  guideLink: z.url(),
  recruiterName: z.string().optional(),
  recruiterEmail: z.email(),
  additionalNotes: z.string(),
}).loose();

export type NotificationPayload = z.infer<typeof NotificationPayloadSchema>;
export type InterviewInvitationPayload = z.infer<typeof InterviewInvitationPayloadSchema>;