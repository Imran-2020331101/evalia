import { describe, it, expect, vi } from 'vitest';

const h = vi.hoisted(() => ({
  get: vi.fn(), post: vi.fn(), chat: vi.fn(), embed: vi.fn(), upsert: vi.fn(), notify: vi.fn(),
}));
vi.mock('../../src/config/database', () => ({ default: () => {} }));
vi.mock('../../src/config/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }, default: { info: vi.fn(), error: vi.fn() } }));
vi.mock('../../src/utils/notify', () => ({ sendNotification: h.notify }));
vi.mock('axios', () => ({ default: { get: h.get, post: h.post } }));
vi.mock('openai', () => ({
  default: class { chat = { completions: { create: h.chat } }; embeddings = { create: h.embed }; },
}));
vi.mock('@qdrant/js-client-rest', () => ({
  QdrantClient: class { upsert = h.upsert; query = vi.fn(); delete = vi.fn(); scroll = vi.fn(); },
}));
vi.mock('../../src/models/JobDetails', async () => {
  const { createModelMock } = await import('../helpers/testDb');
  return { JobDetailsModel: createModelMock() };
});
vi.mock('../../src/models/CompatibilityReview', async () => {
  const { createModelMock } = await import('../helpers/testDb');
  return { CompatibilityReviewModel: createModelMock() };
});

import { api } from '../helpers/testApp';
import { JobDetailsModel } from '../../src/models/JobDetails';
import { chain, jobDoc, OID, validCreateJobBody } from '../helpers/testDb';

const J: any = JobDetailsModel;
const A = OID(0xa);
const flush = () => new Promise((r) => setTimeout(r, 10));

describe('POST /api/jobs', () => {
  it('creates a job and indexes it in the vector DB (LLM + embeddings + Qdrant mocked)', async () => {
    J.saveMock.mockImplementation(async (d: any) => jobDoc({ ...d, _id: { toString: () => A } }));
    h.chat.mockResolvedValue({ choices: [{ message: { content: JSON.stringify({ industry: 'STEM & Technical', skills: 'ts', experience: '3y', projects: '', education: 'BSc' }) } }] });
    h.embed.mockResolvedValue({ data: [{ embedding: [0.1, 0.2] }] });
    h.upsert.mockResolvedValue({ status: 'completed', operation_id: 1 });

    const res = await api().post('/api/jobs').send(validCreateJobBody());
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(J.ctor).toHaveBeenCalledWith(expect.objectContaining({ title: 'Backend Engineer', postedBy: 'user-1', status: 'ACTIVE' }));
    expect(h.embed).toHaveBeenCalledTimes(3); // projects is empty
    const [collection, { points }] = h.upsert.mock.calls[0];
    expect(collection).toBe('jobs');
    expect(points.map((p: any) => p.payload.section)).toEqual(['skills', 'experience', 'education']);
    expect(points[0].payload).toMatchObject({ 'document-id': A, industry: 'STEM & Technical', is_active: true });
  });

  it('400 on invalid payload and nothing is saved', async () => {
    const res = await api().post('/api/jobs').send(validCreateJobBody({ requirements: [] }));
    expect(res.status).toBe(400);
    expect(res.body.details.join()).toContain('requirements');
    expect(J.ctor).not.toHaveBeenCalled();
  });

  it('500 when the vector index fails after save (job is already persisted)', async () => {
    J.saveMock.mockResolvedValue(jobDoc());
    h.chat.mockResolvedValue({ choices: [{ message: { content: 'not-json' } }] });
    const res = await api().post('/api/jobs').send(validCreateJobBody());
    expect(res.status).toBe(500);
    expect(J.saveMock).toHaveBeenCalled();
  });
});

describe('GET /api/jobs', () => {
  it('lists with pagination and filters', async () => {
    const q = chain([{ title: 'a' }]);
    J.find.mockReturnValue(q);
    J.countDocuments.mockResolvedValue(23);
    const res = await api().get('/api/jobs?status=ACTIVE&page=2&limit=10&sortOrder=asc');
    expect(res.status).toBe(200);
    expect(res.body.data.pagination).toEqual({ currentPage: 2, totalPages: 3, totalCount: 23, hasNextPage: true, hasPrevPage: true, limit: 10 });
    expect(J.find).toHaveBeenCalledWith({ status: 'ACTIVE' });
    expect(q.sort).toHaveBeenCalledWith({ createdAt: 1 });
  });
  it('400 for bad query', async () => {
    const res = await api().get('/api/jobs?limit=0');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid query parameters');
  });
});

describe('GET /api/jobs/:jobId', () => {
  it('returns the job', async () => {
    J.findById.mockReturnValue(chain(jobDoc({ title: 'X' })));
    J.findByIdAndUpdate.mockReturnValue(chain(null));
    const res = await api().get(`/api/jobs/${A}`);
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('X');
  });
  it('rejects malformed ids (surfaces as 500, see errorHandling tests)', async () => {
    expect((await api().get('/api/jobs/xyz')).status).toBe(500);
  });
});

describe('organization endpoints', () => {
  it('GET /organization/:id returns paginated jobs', async () => {
    J.find.mockReturnValue(chain([{ a: 1 }]));
    J.countDocuments.mockResolvedValue(1);
    const res = await api().get('/api/jobs/organization/org-1?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('org-1');
    expect(J.find).toHaveBeenCalledWith({ 'company.OrganizationId': 'org-1' });
    expect(res.body.data.pagination.limit).toBe(5);
  });
  it('DELETE /organization/:id soft-deletes', async () => {
    J.updateMany.mockReturnValue(chain({ modifiedCount: 4 }));
    const res = await api().delete('/api/jobs/organization/org-1');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ modifiedCount: 4 });
  });
});

describe('status / delete', () => {
  it('PUT /:id/status updates', async () => {
    J.findByIdAndUpdate.mockReturnValue(chain({ _id: A, status: 'ARCHIVED' }));
    const res = await api().put(`/api/jobs/${A}/status`).send({ status: 'ARCHIVED' });
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ jobId: A, status: 'ARCHIVED' });
  });
  it('PUT /:id/status 400 for invalid status', async () => {
    const res = await api().put(`/api/jobs/${A}/status`).send({ status: 'NOPE' });
    expect(res.status).toBe(400);
  });
  it('DELETE /:id', async () => {
    J.findByIdAndDelete.mockReturnValue(chain({ _id: A }));
    const res = await api().delete(`/api/jobs/${A}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Job deleted successfully');
  });
});

describe('batch endpoints', () => {
  it('POST /user/applied returns the jobs for valid ids and ignores nothing invalid', async () => {
    J.find.mockResolvedValue([{ _id: A }]);
    const res = await api().post('/api/jobs/user/applied').send([A]);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Retrieved 1 job details');
  });
  it('POST /user/applied 400 for empty array; /user/saved accepts it', async () => {
    expect((await api().post('/api/jobs/user/applied').send([])).status).toBe(400);
    J.find.mockResolvedValue([]);
    expect((await api().post('/api/jobs/user/saved').send([])).status).toBe(200);
  });
  it('400 for non-array / bad ids', async () => {
    expect((await api().post('/api/jobs/user/saved').send({ a: 1 })).status).toBe(400);
    expect((await api().post('/api/jobs/user/saved').send(['zzz'])).status).toBe(400);
  });
});

describe('interview questions & description', () => {
  it('GET /:id/interview-questions', async () => {
    J.findOne.mockReturnValue(chain({ interviewQA: [{ question: 'Q1' }, { question: 'Q2' }] }));
    const res = await api().get(`/api/jobs/${A}/interview-questions`);
    expect(res.body).toEqual({ success: true, message: 'Retrieved 2 Questions for interview', data: ['Q1', 'Q2'] });
  });
  it('GET /:id/description', async () => {
    J.findOne.mockResolvedValue({ jobDescription: 'Great job' });
    const res = await api().get(`/api/jobs/${A}/description`);
    expect(res.body.data).toBe('Great job');
  });
  it('POST /generate/interview-questions uses the LLM output', async () => {
    h.chat.mockResolvedValue({ choices: [{ message: { content: '```json\n{"questions":[{"question":"Q","referenceAnswer":"A"}]}\n```' } }] });
    const res = await api().post('/api/jobs/generate/interview-questions').send({ jobDescription: 'Do things' });
    expect(res.status).toBe(200);
    expect(res.body.data.questions).toHaveLength(1);
    expect(h.chat.mock.calls[0][0].messages[0].content).toContain('Do things');
  });
  it('POST /generate/interview-questions 400 without a description', async () => {
    expect((await api().post('/api/jobs/generate/interview-questions').send({})).status).toBe(400);
  });
});

describe('application lifecycle', () => {
  const body = { jobId: A, email: 'ann@x.com', candidateId: OID(0xb), candidateName: 'Ann' };

  it('POST /apply records the application, notifies the recruiter and attaches an AI review in the background', async () => {
    J.findById.mockReturnValue(chain(jobDoc({ applications: [] })));
    J.findByIdAndUpdate.mockReturnValue(chain(jobDoc()));
    J.updateOne.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });
    h.get.mockResolvedValue({ data: { skills: {} } });
    h.chat.mockResolvedValue({ choices: [{ message: { content: '{"matchPercentage":50,"fit":"Average","strength":[],"weakness":[]}' } }] });
    const { CompatibilityReviewModel } = await import('../../src/models/CompatibilityReview');
    (CompatibilityReviewModel as any).saveMock.mockResolvedValue({ _id: { toString: () => 'rev-1' } });

    const res = await api().post('/api/jobs/apply').send(body);
    expect(res.status).toBe(200);
    expect(h.notify).toHaveBeenCalledWith(expect.objectContaining({ type: 'new.job.application' }), 'notifications');
    await flush();
    expect(J.updateOne).toHaveBeenCalledWith(
      { _id: A, 'applications.candidateEmail': 'ann@x.com' },
      { $set: { 'applications.$.reviewId': 'rev-1' } },
    );
  });

  it('POST /apply validation failure', async () => {
    const res = await api().post('/api/jobs/apply').send({ ...body, email: 'bad' });
    expect(res.status).toBe(500); // ZodError -> global handler (known bug)
    expect(J.findById).not.toHaveBeenCalled();
  });

  it('POST /:id/withdraw removes the application', async () => {
    J.findById.mockReturnValue(chain(jobDoc({ applications: [{ candidateEmail: 'ann@x.com' }] })));
    J.findByIdAndUpdate.mockReturnValue(chain({ applications: [] }));
    const res = await api().post(`/api/jobs/${A}/withdraw`).send(body);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ applications: [] });
  });

  const candidates = [{ candidateId: OID(0xb), candidateName: 'Ann', candidateEmail: 'ann@x.com' }];

  it('POST /:id/shortlist updates, creates interviews and emails candidates', async () => {
    const job = jobDoc({ interviewQA: [{ question: 'Q' }] });
    J.findOneAndUpdate.mockReturnValue(chain(job));
    J.findById.mockReturnValue(chain(job));
    h.post.mockResolvedValue({ data: { data: { interviewId: 'iv-1', deadline: '2030-01-01T00:00:00.000Z' } } });
    const res = await api().post(`/api/jobs/${A}/shortlist`).send({ candidates });
    expect(res.status).toBe(200);
    await flush();
    expect(h.post).toHaveBeenCalledWith('http://interview.test/api/interview', expect.objectContaining({ candidate: expect.objectContaining({ email: 'ann@x.com' }) }));
    expect(h.notify).toHaveBeenCalledWith(expect.objectContaining({ type: 'job.application.shortlisted', interviewLink: 'http://frontend.test/workspace/interviews/on-going/iv-1' }), 'email-notification');
  });

  it('POST /:id/finalist accepts candidates and emails them', async () => {
    J.findOneAndUpdate.mockReturnValue(chain(jobDoc()));
    J.findById.mockReturnValue(chain(jobDoc()));
    const res = await api().post(`/api/jobs/${A}/finalist`).send({ candidates });
    expect(res.status).toBe(200);
    await flush();
    expect(J.findOneAndUpdate.mock.calls[0][1]).toEqual({ $set: { 'applications.$[elem].status': 'ACCEPTED' } });
    expect(h.notify).toHaveBeenCalledWith(expect.objectContaining({ type: 'job.application.accepted' }), 'email-notification');
  });

  it('POST /:id/reject/status/:status rejects and emails', async () => {
    const { CompatibilityReviewModel } = await import('../../src/models/CompatibilityReview');
    (CompatibilityReviewModel as any).findOne.mockResolvedValue(null);
    J.findOneAndUpdate.mockReturnValue(chain(jobDoc()));
    J.findById.mockReturnValue(chain(jobDoc()));
    const res = await api().post(`/api/jobs/${A}/reject/status/PENDING`).send({ candidates });
    expect(res.status).toBe(200);
    await flush();
    expect(h.notify).toHaveBeenCalledWith(expect.objectContaining({ type: 'job.application.rejected' }), 'email-notification');
  });

  it('shortlist rejects malformed candidate payloads', async () => {
    const res = await api().post(`/api/jobs/${A}/shortlist`).send({ candidates: [{ candidateId: 'x' }] });
    expect(res.status).toBe(500); // ZodError -> global handler (known bug)
  });
});

describe('GET /api/jobs/test', () => {
  it('sends interview invitations for the hard-coded demo data', async () => {
    J.findById.mockReturnValue(chain(jobDoc()));
    h.post.mockResolvedValue({ data: { data: { interviewId: 'iv', deadline: '2030-01-01' } } });
    const res = await api().get('/api/jobs/test');
    expect(res.status).toBe(200);
    expect(res.body.data.candidatesInvited).toBe(2);
  });
  it('500 with message when the downstream call fails', async () => {
    J.findById.mockReturnValue(chain(null));
    const res = await api().get('/api/jobs/test');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
