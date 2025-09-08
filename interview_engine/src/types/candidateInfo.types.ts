import {z} from 'zod';

export const scheduleInterview = z.object({
    candidate : z.object({
        id    : z.string(),
        email : z.string(),
        name  : z.string(),
    }),
    job : z.object({
        id    : z.string(),
        title : z.string(),
        interviewQA : z.array(z.object({
          question: z.string(),
          referenceAnswer: z.string(),
        }))
    }),
    deadline: z.date(),
}).loose();


