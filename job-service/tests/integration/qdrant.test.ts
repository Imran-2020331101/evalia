import { describe, it, expect, vi } from 'vitest';

const h = vi.hoisted(() => ({ get: vi.fn(), query: vi.fn(), upsert: vi.fn() }));
vi.mock('../../src/config/database', () => ({ default: () => {} }));
vi.mock('../../src/config/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }, default: { info: vi.fn(), error: vi.fn() } }));
vi.mock('../../src/utils/notify', () => ({ sendNotification: vi.fn() }));
vi.mock('axios', () => ({ default: { get: h.get, post: vi.fn() } }));
vi.mock('@qdrant/js-client-rest', () => ({
  QdrantClient: class { query = h.query; upsert = h.upsert; delete = vi.fn(); scroll = vi.fn(); },
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

const pt = (id: string, score: number, extra: any = {}) => ({ id: Math.random(), version: 1, score, payload: { 'document-id': id, ...extra } });

describe('GET /api/jobs/candidates/:candidateId/suggestions (resume vector -> Qdrant -> scores)', () => {
  const resumeVector = {
    skills: { vector: [1, 0], payload: {} },
    experience: { vector: [0, 1], payload: {} },
    projects: undefined,
  };

  it('searches once per section against the configured collection and merges scores per job', async () => {
    h.get.mockResolvedValue({ data: { data: resumeVector } });
    h.query.mockImplementation(async (_c: string, { query }: any) =>
      query[0] === 1
        ? { points: [pt('job1', 0.912, { industry: 'STEM & Technical', is_active: true }), pt('job2', 0.5)] }
        : { points: [pt('job1', 0.734)] });

    const res = await api().get('/api/jobs/candidates/cand-1/suggestions');
    expect(res.status).toBe(200);
    expect(h.get).toHaveBeenCalledWith('http://resume.test/api/resume/cand-1/vector');
    expect(h.query).toHaveBeenCalledTimes(2);
    expect(h.query.mock.calls[0][0]).toBe('jobs-test');
    expect(h.query.mock.calls[0][1]).toMatchObject({ limit: 10, with_payload: true });
    expect(res.body.data).toEqual([
      { jobId: 'job1', industry: 'STEM & Technical', isActive: true, skills: 0.91, experience: 0.73, education: null, projects: null },
      { jobId: 'job2', industry: null, isActive: null, skills: 0.5, experience: null, education: null, projects: null },
    ]);
  });

  it('returns an empty list when Qdrant has no matches', async () => {
    h.get.mockResolvedValue({ data: { data: resumeVector } });
    h.query.mockResolvedValue({ points: [] });
    const res = await api().get('/api/jobs/candidates/cand-1/suggestions');
    expect(res.body).toEqual({ success: true, data: [] });
  });

  it('fails when the resume service has no vector for the candidate', async () => {
    h.get.mockResolvedValue({ data: { data: null } });
    const res = await api().get('/api/jobs/candidates/cand-1/suggestions');
    expect(res.status).toBe(500); // ApiError(400) flattened by global handler (known bug)
    expect(res.body.message).toBe('Failed to fetch resume-vector from resume-service');
    expect(h.query).not.toHaveBeenCalled();
  });

  it('fails when Qdrant is unreachable', async () => {
    h.get.mockResolvedValue({ data: { data: resumeVector } });
    h.query.mockRejectedValue(new Error('qdrant unreachable'));
    const res = await api().get('/api/jobs/candidates/cand-1/suggestions');
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('qdrant unreachable');
  });
});
