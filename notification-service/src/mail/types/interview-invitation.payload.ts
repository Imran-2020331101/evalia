import { z } from 'zod';

export const InterviewInvitationPayloadSchema = z.object({
  candidateName     : z.string(),
  candidateEmail    : z.email(),
  jobTitle          : z.string(),
  OrganizationName  : z.string(),
  OrganizationEmail : z.email(),
  deadline          : z.string(),
  interviewLink     : z.url(),
  guideLink         : z.url(),
  recruiterName     : z.string().optional(),
  additionalNotes   : z.string().optional(),
}).loose();

export type InterviewInvitationPayload = z.infer<typeof InterviewInvitationPayloadSchema>;