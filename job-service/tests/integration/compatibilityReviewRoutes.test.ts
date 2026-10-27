import { describe, it, expect, vi } from 'vitest';

const h = vi.hoisted(() => ({ get: vi.fn(), create: vi.fn() }));
vi.mock('../../src/config/database', () => ({ default: () => {} }));
vi.mock('../../src/config/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }, default: { info: vi.fn(), error: vi.fn() } }));
vi.mock('../../src/utils/notify', () => ({ sendNotification: vi.fn() }));
vi.mock('axios', () => ({ default: { get: h.get, post: vi.fn() } }));
vi.mock('openai', () => ({
  default: class { chat = { completions: { create: h.create } }; embeddings = { create: vi.fn() }; },
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
import { CompatibilityReviewModel } from '../../src/models/CompatibilityReview';
import { chain, jobDoc, OID } from '../helpers/testDb';

const J: any = JobDetailsModel;
const R: any = CompatibilityReviewModel;

describe('GET /api/compatibility/:reviewId', () => {
  it('returns the review', async () => {
    R.findById.mockResolvedValue({ _id: 'r1', fit: 'Good Fit' });
    const res = await api().get('/api/compatibility/r1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: { _id: 'r1', fit: 'Good Fit' } });
  });
  it('404 when absent', async () => {
    R.findById.mockResolvedValue(null);
    const res = await api().get('/api/compatibility/r1');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ success: false, error: 'Compatibility review not found' });
  });
});

describe('POST /api/compatibility/create', () => {
  it('400 on invalid payload', async () => {
    const res = await api().post('/api/compatibility/create').send({ jobId: '', candidateEmail: 'x' });
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveLength(2);
  });

  it('runs the whole pipeline: resume -> job -> LLM -> saved review', async () => {
    h.get.mockResolvedValue({ data: { skills: { technical: ['ts'] } } });
    J.findById.mockReturnValue(chain(jobDoc({ _id: OID(1) })));
    J.findByIdAndUpdate.mockReturnValue(chain(null));
    h.create.mockResolvedValue({
      choices: [{ message: { content: '```json\n{"matchPercentage":91,"fit":"Best Fit","strength":["a"],"weakness":["b"]}\n```' } }],
    });
    R.saveMock.mockImplementation(async (d: any) => ({ ...d }));
    const res = await api().post('/api/compatibility/create').send({ jobId: OID(1), candidateEmail: 'a@b.com' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ candidateEmail: 'a@b.com', matchPercentage: 91, fit: 'Best Fit', strengths: ['a'], weaknesses: ['b'] });
    expect(h.get).toHaveBeenCalledWith('http://resume.test/api/resume/retrieve?email=a@b.com');
  });

  it('responds 200 with an empty body when the LLM output is unusable (service swallows errors)', async () => {
    h.get.mockResolvedValue({ data: {} });
    J.findById.mockReturnValue(chain(jobDoc()));
    J.findByIdAndUpdate.mockReturnValue(chain(null));
    h.create.mockResolvedValue({ choices: [{ message: { content: 'not json' } }] });
    const res = await api().post('/api/compatibility/create').send({ jobId: OID(1), candidateEmail: 'a@b.com' });
    expect(res.status).toBe(200);
    expect(res.text).toBe('');
  });

  it('500 when the job does not exist', async () => {
    h.get.mockResolvedValue({ data: {} });
    J.findById.mockReturnValue(chain(null));
    const res = await api().post('/api/compatibility/create').send({ jobId: OID(1), candidateEmail: 'a@b.com' });
    expect(res.status).toBe(500);
  });
});
