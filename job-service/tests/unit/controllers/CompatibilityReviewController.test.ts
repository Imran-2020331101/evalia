import { describe, it, expect, vi } from 'vitest';

const h = vi.hoisted(() => ({ get: vi.fn(), findJob: vi.fn(), evaluate: vi.fn() }));
vi.mock('axios', () => ({ default: { get: h.get } }));
vi.mock('../../../src/models/CompatibilityReview', async () => {
  const { createModelMock } = await import('../../helpers/testDb');
  return { CompatibilityReviewModel: createModelMock() };
});
vi.mock('../../../src/services/jobService', () => ({ JobService: { findJobById: h.findJob } }));
vi.mock('../../../src/services/ApplicationCompatibilityService', () => ({ ApplicationCompatibilityService: { evaluateCandidateProfile: h.evaluate } }));
vi.mock('../../../src/config/logger', () => ({ logger: { info: vi.fn() } }));

import { CompatibilityReviewController } from '../../../src/controllers/CompatibilityReviewController';
import { CompatibilityReviewModel } from '../../../src/models/CompatibilityReview';
import { invoke } from '../../helpers/testDb';

const M: any = CompatibilityReviewModel;
const ctrl = new CompatibilityReviewController();

describe('getCompatibilityById', () => {
  it('400 when reviewId is missing', async () => {
    const { res } = await invoke(ctrl.getCompatibilityById, { params: {} });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Review ID is required' });
  });
  it('404 when not found', async () => {
    M.findById.mockResolvedValue(null);
    const { res } = await invoke(ctrl.getCompatibilityById, { params: { reviewId: 'r1' } });
    expect(res.status).toHaveBeenCalledWith(404);
  });
  it('returns the review', async () => {
    M.findById.mockResolvedValue({ _id: 'r1' });
    const { res } = await invoke(ctrl.getCompatibilityById, { params: { reviewId: 'r1' } });
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { _id: 'r1' } });
  });
  it('forwards DB errors to next', async () => {
    const err = new Error('db');
    M.findById.mockRejectedValue(err);
    const { next } = await invoke(ctrl.getCompatibilityById, { params: { reviewId: 'r1' } });
    expect(next).toHaveBeenCalledWith(err);
  });
});

describe('createCompatibilityReview', () => {
  const body = { jobId: 'j1', candidateEmail: 'a@b.com' };

  it.each([
    [{}, 2],
    [{ jobId: '', candidateEmail: 'a@b.com' }, 1],
    [{ jobId: 'j', candidateEmail: 'not-an-email' }, 1],
  ])('400 with details for invalid body %j', async (b, n) => {
    const { res } = await invoke(ctrl.createCompatibilityReview, { body: b });
    expect(res.status).toHaveBeenCalledWith(400);
    const payload = res.json.mock.calls[0][0];
    expect(payload.error).toBe('Validation failed');
    expect(payload.details).toHaveLength(n);
  });

  it('fetches the resume, loads the job, evaluates and returns the result', async () => {
    h.get.mockResolvedValue({ data: { skills: {} } });
    h.findJob.mockResolvedValue({ _id: 'j1' });
    h.evaluate.mockResolvedValue({ _id: 'rev1' });
    const { res } = await invoke(ctrl.createCompatibilityReview, { body });
    expect(h.get).toHaveBeenCalledWith('http://resume.test/api/resume/retrieve?email=a@b.com');
    expect(h.evaluate).toHaveBeenCalledWith({ _id: 'j1' }, { skills: {} }, 'a@b.com');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ _id: 'rev1' });
  });

  it('errors when the job lookup yields null', async () => {
    h.get.mockResolvedValue({ data: {} });
    h.findJob.mockResolvedValue(null);
    const { next } = await invoke(ctrl.createCompatibilityReview, { body });
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'Job not found' }));
  });

  it('forwards resume-service failures', async () => {
    h.get.mockRejectedValue(new Error('resume down'));
    const { next } = await invoke(ctrl.createCompatibilityReview, { body });
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'resume down' }));
  });
});
