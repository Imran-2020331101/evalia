import { describe, it, expect, vi } from 'vitest';

const h = vi.hoisted(() => ({ bot: vi.fn() }));
vi.mock('../../../src/config/OpenRouter', () => ({ default: h.bot }));
vi.mock('../../../src/config/logger', () => ({ default: { info: vi.fn(), error: vi.fn() } }));
vi.mock('../../../src/models/CompatibilityReview', async () => {
  const { createModelMock } = await import('../../helpers/testDb');
  return { CompatibilityReviewModel: createModelMock() };
});

import { ApplicationCompatibilityService as svc } from '../../../src/services/ApplicationCompatibilityService';
import { CompatibilityReviewModel as Model } from '../../../src/models/CompatibilityReview';
import logger from '../../../src/config/logger';

const M: any = Model;
const job: any = { _id: 'job1', title: 'T' };
const resume: any = { skills: {} };
const ai = { matchPercentage: 77, fit: 'Good Fit', strength: ['s1'], weakness: ['w1'] };

describe('ApplicationCompatibilityService.evaluateCandidateProfile', () => {
  it('prompts the LLM, parses JSON and saves a review with mapped fields', async () => {
    h.bot.mockResolvedValue(JSON.stringify(ai));
    M.saveMock.mockImplementation(async (d: any) => ({ ...d, saved: true }));
    const res: any = await svc.evaluateCandidateProfile(job, resume, 'a@b.com');
    expect(h.bot.mock.calls[0][0]).toContain(JSON.stringify(resume));
    expect(h.bot.mock.calls[0][0]).toContain(JSON.stringify(job));
    expect(M.ctor).toHaveBeenCalledWith({
      jobId: 'job1', candidateEmail: 'a@b.com', matchPercentage: 77, fit: 'Good Fit',
      strengths: ['s1'], weaknesses: ['w1'],
    });
    expect(res.saved).toBe(true);
  });

  it('strips markdown fences from the model output', async () => {
    h.bot.mockResolvedValue('```json\n' + JSON.stringify(ai) + '\n```');
    M.saveMock.mockImplementation(async (d: any) => d);
    const res: any = await svc.evaluateCandidateProfile(job, resume, 'a@b.com');
    expect(res.matchPercentage).toBe(77);
  });

  it('strips bare fences too', async () => {
    h.bot.mockResolvedValue('```\n' + JSON.stringify(ai) + '\n```');
    M.saveMock.mockImplementation(async (d: any) => d);
    expect(((await svc.evaluateCandidateProfile(job, resume, 'x')) as any).fit).toBe('Good Fit');
  });

  it('uses empty-string fallbacks for missing job id / email', async () => {
    h.bot.mockResolvedValue(JSON.stringify(ai));
    M.saveMock.mockImplementation(async (d: any) => d);
    await svc.evaluateCandidateProfile({} as any, resume, '');
    expect(M.ctor).toHaveBeenCalledWith(expect.objectContaining({ jobId: '', candidateEmail: '' }));
  });

  it('handles non-string LLM output (parse fails) by logging and returning undefined', async () => {
    h.bot.mockResolvedValue({ already: 'object' });
    await expect(svc.evaluateCandidateProfile(job, resume, 'a')).resolves.toBeUndefined();
    expect(logger.error).toHaveBeenCalled();
  });

  it('returns undefined and logs on invalid JSON', async () => {
    h.bot.mockResolvedValue('not json');
    await expect(svc.evaluateCandidateProfile(job, resume, 'a')).resolves.toBeUndefined();
    expect(logger.error).toHaveBeenCalledWith('Error during candidate evaluation', expect.any(Object));
  });

  it('returns undefined when save fails', async () => {
    h.bot.mockResolvedValue(JSON.stringify(ai));
    M.saveMock.mockRejectedValue(new Error('db'));
    await expect(svc.evaluateCandidateProfile(job, resume, 'a')).resolves.toBeUndefined();
  });

  it('returns undefined when the LLM call fails', async () => {
    h.bot.mockRejectedValue(new Error('llm'));
    await expect(svc.evaluateCandidateProfile(job, resume, 'a')).resolves.toBeUndefined();
  });
});

describe('ApplicationCompatibilityService.findCompatibilityReview', () => {
  it('returns the matching review', async () => {
    M.findOne.mockResolvedValue({ _id: 'r1' });
    await expect(svc.findCompatibilityReview('j', 'e')).resolves.toEqual({ _id: 'r1' });
    expect(M.findOne).toHaveBeenCalledWith({ jobId: 'j', candidateEmail: 'e' });
  });
  it('returns null when none exists', async () => {
    M.findOne.mockResolvedValue(null);
    await expect(svc.findCompatibilityReview('j', 'e')).resolves.toBeNull();
    expect(logger.info).toHaveBeenCalledWith('No compatibility review found', expect.any(Object));
  });
  it('returns null on database errors', async () => {
    M.findOne.mockRejectedValue(new Error('db'));
    await expect(svc.findCompatibilityReview('j', 'e')).resolves.toBeNull();
    expect(logger.error).toHaveBeenCalled();
  });
});
