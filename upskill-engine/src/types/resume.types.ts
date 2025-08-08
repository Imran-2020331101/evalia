 import {z} from 'zod';
export type ExtractedResume = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  summary?: string;
  skills?: string[];
  experience?: Array<{ company?: string; role?: string; duration?: string; description?: string }>;
  education?: Array<{ institution?: string; degree?: string; year?: string }>;
  certifications?: string[];
  projects?: string[];
};


export const OverviewSchema = z.object({
  matchPercentage : z.number(),
  fit: z.enum(['Best Fit','Good Fit','Average','Bad Fit']),
  strength: z.array(z.string()),
  weakness: z.array(z.string())
})

export type Overview  = z.infer<typeof OverviewSchema>;