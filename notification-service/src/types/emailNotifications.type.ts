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
});

export const InterviewInvitationPayloadSchema = z.object({
  candidateName: z.string(),
  jobTitle: z.string(),
  companyName: z.string(),
  deadline: z.string(),
  interviewLink: z.string().url(),
  guideLink: z.string().url(),
  recruiterName: z.string(),
  recruiterEmail: z.string().email(),
  additionalNotes: z.string(),
});

export type NotificationPayload = z.infer<typeof NotificationPayloadSchema>;
export type InterviewInvitationPayload = z.infer<typeof InterviewInvitationPayloadSchema>;