import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import supertest from 'supertest';

const h = vi.hoisted(() => {
  const mk = (names: string[]) =>
    Object.fromEntries(names.map((n) => [n, (req: any, res: any) => res.json({ handler: n, params: req.params })]));
  return {
    job: mk(['getAllJobsOfAnOrganization', 'deleteAllJobsOfAnOrganization', 'fetchBatchJobInfo', 'getAllJobsSavedByAUser',
      'getAllJobs', 'createJob', 'generateInterviewQuestions', 'getJobById', 'deleteJob', 'updateJobStatus',
      'getInterviewQuestionsOfAJob', 'getDescriptionOfAJob', 'getJobSuggestions']),
    app: mk(['test', 'shortListCandidates', 'finalizeCandidates', 'applyToJob', 'withDrawApplicationFromAJob', 'rejectRemainingCandidates']),
  };
});
vi.mock('../../../src/controllers/jobController', () => ({ jobController: h.job }));
vi.mock('../../../src/controllers/applicationController', () => ({ applicationController: h.app }));

import jobRoutes from '../../../src/routes/jobRoutes';

const app = express().use(express.json()).use('/jobs', jobRoutes);
const A = 'a'.repeat(24);

describe('jobRoutes wiring', () => {
  const table: Array<[string, string, string]> = [
    ['get', '/jobs/test', 'test'],
    ['get', '/jobs/organization/org1', 'getAllJobsOfAnOrganization'],
    ['delete', '/jobs/organization/org1', 'deleteAllJobsOfAnOrganization'],
    ['post', '/jobs/user/applied', 'fetchBatchJobInfo'],
    ['post', '/jobs/user/saved', 'getAllJobsSavedByAUser'],
    ['get', '/jobs', 'getAllJobs'],
    ['post', '/jobs', 'createJob'],
    ['post', '/jobs/generate/interview-questions', 'generateInterviewQuestions'],
    ['post', `/jobs/${A}/shortlist`, 'shortListCandidates'],
    ['post', `/jobs/${A}/finalist`, 'finalizeCandidates'],
    ['get', `/jobs/${A}`, 'getJobById'],
    ['delete', `/jobs/${A}`, 'deleteJob'],
    ['put', `/jobs/${A}/status`, 'updateJobStatus'],
    ['get', `/jobs/${A}/interview-questions`, 'getInterviewQuestionsOfAJob'],
    ['get', `/jobs/${A}/description`, 'getDescriptionOfAJob'],
    ['post', '/jobs/apply', 'applyToJob'],
    ['post', `/jobs/${A}/withdraw`, 'withDrawApplicationFromAJob'],
    ['post', `/jobs/${A}/reject/status/PENDING`, 'rejectRemainingCandidates'],
    ['get', '/jobs/candidates/c1/suggestions', 'getJobSuggestions'],
  ];

  it.each(table)('%s %s -> %s', async (method, url, handler) => {
    const res = await (supertest(app) as any)[method](url);
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe(handler);
  });

  it('extracts route params', async () => {
    const r = await supertest(app).post(`/jobs/${A}/reject/status/SHORTLISTED`);
    expect(r.body.params).toEqual({ jobId: A, status: 'SHORTLISTED' });
  });

  it('static GET /test is not shadowed by /:jobId', async () => {
    expect((await supertest(app).get('/jobs/test')).body.handler).toBe('test');
  });

  it('unregistered method/path returns 404', async () => {
    expect((await supertest(app).patch('/jobs')).status).toBe(404);
    expect((await supertest(app).put('/jobs/organization/o')).status).toBe(404);
  });
});
