import { z } from 'zod';

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

export type InterviewInvitationPayload = z.infer<typeof InterviewInvitationPayloadSchema>;