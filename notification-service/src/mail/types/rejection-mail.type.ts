import { z } from 'zod';

export const RejectionMailPayloadSchema = z.object({
  type : z.string(),
  candidateId: z.string(),
  candidateName: z.string(),
  candidateEmail: z.string().email(),
  jobTitle: z.string(),
  OrganizationId: z.string(),
  OrganizationName: z.string(),
  OrganizationEmail: z.string(),
  data: z.object({
    stage: z.string(),
    review: z.object({
      matchPercentage : z.number().min(0).max(100),
      fit             : z.enum(['Best Fit', 'Good Fit', 'Average', 'Bad Fit']),
      strengths      : z.array(z.string()),
      weaknesses      : z.array(z.string()),
    }),
    interviewEvaluation : z.string().optional(),
  })

}).loose();
export type RejectionMailPayload = z.infer<typeof RejectionMailPayloadSchema>;