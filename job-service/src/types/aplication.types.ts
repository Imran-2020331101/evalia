import { z } from "zod";

export const CandidateInfoSchema = z.object({
  candidateId: z.string(),
  candidateName: z.string(),
  candidateEmail: z.string().email(),
});

export const ShortlistRequest = z.object({
  candidates: z.array(CandidateInfoSchema),
});

// Types (inferred from schemas)
export type CandidateInfo = z.infer<typeof CandidateInfoSchema>;
export type ShortlistRequest = z.infer<typeof ShortlistRequest>;



const InterviewResponseSchema = z.object({
  interviewId: z.string(),
  candidateId: z.string(),
  jobId: z.string(),
  jobTitle: z.string(),
  deadline: z.coerce.date(),
  totalQuestions: z.number(),
  status: z.string(),
});

// Type inferred from schema
export type InterviewData = z.infer<typeof InterviewResponseSchema>;