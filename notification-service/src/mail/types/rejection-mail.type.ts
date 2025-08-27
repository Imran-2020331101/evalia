import { z } from 'zod';

export const RejectionMailPayloadSchema = z.object({
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
export type RejectionMailPayload = z.infer<typeof RejectionMailPayloadSchema>;