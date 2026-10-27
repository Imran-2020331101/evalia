import { describe, it, expect, vi } from 'vitest';

const h = vi.hoisted(() => ({
  get: vi.fn(), findJob: vi.fn(), addReview: vi.fn(), evaluate: vi.fn(),
  apply: vi.fn(), withdraw: vi.fn(), shortlist: vi.fn(), finalize: vi.fn(), reject: vi.fn(), invite: vi.fn(),
}));
vi.mock('axios', () => ({ default: { get: h.get } }));
vi.mock('../../../src/models/JobDetails', () => ({ JobDetailsModel: {} }));
vi.mock('../../../src/config/logger', () => ({ logger: { info: vi.fn() } }));
vi.mock('../../../src/services/jobService', () => ({ JobService: { findJobById: h.findJob, addReviewIdToApplication: h.addReview } }));
vi.mock('../../../src/services/ApplicationCompatibilityService', () => ({ ApplicationCompatibilityService: { evaluateCandidateProfile: h.evaluate } }));
vi.mock('../../../src/services/applicationService', () => ({
  applicationService: {
    applyToJob: h.apply, withdrawApplication: h.withdraw, shortlistCandidate: h.shortlist,
    finalizeCandidate: h.finalize, rejectCandidate: h.reject, sendInterviewInvitation: h.invite,
  },
}));

import { applicationController as ctrl, ApplicationController } from '../../../src/controllers/applicationController';
import { invoke, OID } from '../../helpers/testDb';

const flush = () => new Promise((r) => setImmediate(r));
const candidates = [{ candidateId: 'c1', candidateName: 'Ann', candidateEmail: 'ann@x.com' }];

describe('applyToJob', () => {
  const body = { jobId: OID(1), email: 'a@x.com', candidateId: OID(2), candidateName: 'Ann' };

  it('applies, responds 200 and evaluates the profile in the background', async () => {
    h.apply.mockResolvedValue({ _id: 'job' });
    h.get.mockResolvedValue({ data: { skills: {} } });
    h.findJob.mockResolvedValue({ _id: 'job' });
    h.evaluate.mockResolvedValue({ _id: { toString: () => 'rev1' } });
    const { res } = await invoke(ctrl.applyToJob, { body });
    expect(h.apply).toHaveBeenCalledWith(OID(1), 'a@x.com', OID(2), 'Ann');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { _id: 'job' } });
    await flush();
    expect(h.get).toHaveBeenCalledWith('http://resume.test/api/resume/retrieve?email=a@x.com');
    expect(h.addReview).toHaveBeenCalledWith(OID(1), 'rev1', 'a@x.com');
  });

  it('defaults the candidate name', async () => {
    h.apply.mockResolvedValue(null);
    const { name, ...rest } = { name: 1, ...body, candidateName: undefined } as any;
    await invoke(ctrl.applyToJob, { body: rest });
    expect(h.apply).toHaveBeenCalledWith(OID(1), 'a@x.com', OID(2), 'No name found');
  });

  it('skips the background evaluation when the service returns nothing', async () => {
    h.apply.mockResolvedValue(null);
    const { res } = await invoke(ctrl.applyToJob, { body });
    expect(res.status).toHaveBeenCalledWith(200);
    await flush();
    expect(h.get).not.toHaveBeenCalled();
  });

  it('does not attach a review when evaluation returns nothing or the job is missing', async () => {
    h.apply.mockResolvedValue({});
    h.get.mockResolvedValue({ data: {} });
    h.findJob.mockResolvedValue({ _id: 'job' });
    h.evaluate.mockResolvedValue(undefined);
    await invoke(ctrl.applyToJob, { body });
    await flush();
    expect(h.addReview).not.toHaveBeenCalled();
    h.findJob.mockResolvedValue(null);
    await invoke(ctrl.applyToJob, { body });
    await flush();
    expect(h.evaluate).toHaveBeenCalledTimes(1);
  });

  it('swallows background failures (response is already sent)', async () => {
    h.apply.mockResolvedValue({});
    h.get.mockRejectedValue(new Error('resume down'));
    const { res, next } = await invoke(ctrl.applyToJob, { body });
    await flush();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  it.each([
    [{ ...body, jobId: 'bad' }],
    [{ ...body, email: 'nope' }],
    [{ ...body, candidateId: 'bad' }],
    [{}],
  ])('forwards a ZodError for invalid body %j', async (b) => {
    const { next, res } = await invoke(ctrl.applyToJob, { body: b });
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'ZodError' }));
    expect(res.json).not.toHaveBeenCalled();
    expect(h.apply).not.toHaveBeenCalled();
  });

  it('forwards service errors', async () => {
    h.apply.mockRejectedValue(new Error('already applied'));
    const { next } = await invoke(ctrl.applyToJob, { body });
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'already applied' }));
  });
});

describe('withDrawApplicationFromAJob', () => {
  const body = { jobId: OID(1), email: 'a@x.com', candidateId: OID(2) };
  it('withdraws', async () => {
    h.withdraw.mockResolvedValue({ ok: 1 });
    const { res } = await invoke(ctrl.withDrawApplicationFromAJob, { body });
    expect(h.withdraw).toHaveBeenCalledWith(OID(1), 'a@x.com', OID(2));
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { ok: 1 } });
  });
  it('forwards ZodError for invalid body', async () => {
    const { next } = await invoke(ctrl.withDrawApplicationFromAJob, { body: { ...body, candidateId: 'x' } });
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'ZodError' }));
  });
});

describe.each([
  ['shortListCandidates', 'shortlist', undefined],
  ['finalizeCandidates', 'finalize', undefined],
  ['rejectRemainingCandidates', 'reject', 'PENDING'],
] as const)('%s', (method, svcName, status) => {
  const params = { jobId: OID(1), ...(status ? { status } : {}) };
  it('delegates to the service and returns its result', async () => {
    h[svcName].mockResolvedValue({ updated: true });
    const { res } = await invoke((ctrl as any)[method], { body: { candidates }, params });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { updated: true } });
    expect(h[svcName]).toHaveBeenCalledWith(...(status ? [OID(1), status, candidates] : [OID(1), candidates]));
  });
  it('forwards ZodError when candidates are malformed', async () => {
    const { next } = await invoke((ctrl as any)[method], { body: { candidates: [{ candidateId: 'c' }] }, params });
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'ZodError' }));
  });
  it('forwards service errors', async () => {
    h[svcName].mockRejectedValue(new Error('nope'));
    const { next } = await invoke((ctrl as any)[method], { body: { candidates }, params });
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'nope' }));
  });
});

describe('test endpoint', () => {
  it('reports success', async () => {
    h.invite.mockResolvedValue(undefined);
    const { res } = await invoke(ctrl.test);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: expect.objectContaining({ candidatesInvited: 2 }) }));
  });
  it('reports 500 with the error message on failure', async () => {
    h.invite.mockRejectedValue(new Error('smtp'));
    const { res } = await invoke(ctrl.test);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Failed to send interview invitations', error: 'smtp' });
  });
  it('exports a class and a singleton instance', () => {
    expect(ctrl).toBeInstanceOf(ApplicationController);
  });
});
