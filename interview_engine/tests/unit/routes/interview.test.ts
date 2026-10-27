import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../src/controllers/InterviewController', () => {
  const h = (name: string) => vi.fn((_req: any, res: any) => res.json({ handler: name }));
  return {
    interviewController: {
      scheduleInterview: h('scheduleInterview'),
      getAllInterviewsOfAUser: h('getAllInterviewsOfAUser'),
      getInterviewDetails: h('getInterviewDetails'),
      getInterviewByJobAndCandidate: h('getInterviewByJobAndCandidate'),
      addTranscriptToInterview: h('addTranscriptToInterview'),
      getSummaryOfAnInterview: h('getSummaryOfAnInterview'),
      getEvaluationByInterviewId: h('getEvaluationByInterviewId'),
    },
  };
});

import request from 'supertest';
import express from 'express';
import { interviewRouter } from '../../../src/routes/interview';

const app = express();
app.use(express.json());
app.use('/api/interview', interviewRouter);

describe('interview router wiring', () => {
  it.each([
    ['post', '/api/interview', 'scheduleInterview'],
    ['get', '/api/interview/user/abc', 'getAllInterviewsOfAUser'],
    ['get', '/api/interview/abc', 'getInterviewDetails'],
    ['get', '/api/interview/job/j1/candidate/c1', 'getInterviewByJobAndCandidate'],
    ['put', '/api/interview/abc/transcript', 'addTranscriptToInterview'],
    ['get', '/api/interview/abc/summary', 'getSummaryOfAnInterview'],
    ['get', '/api/interview/abc/evaluation', 'getEvaluationByInterviewId'],
  ] as const)('%s %s -> %s', async (method, url, handler) => {
    const res = await (request(app) as any)[method](url);
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe(handler);
  });

  it('does not expose unrelated methods/paths', async () => {
    expect((await request(app).delete('/api/interview/abc')).status).toBe(404);
    expect((await request(app).get('/api/interview/abc/unknown/x')).status).toBe(404);
  });
});
