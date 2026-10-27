import { describe, it, expect, vi } from 'vitest';

const h = vi.hoisted(() => ({ notify: vi.fn(), post: vi.fn() }));
vi.mock('../../../src/models/JobDetails', async () => {
  const { createModelMock } = await import('../../helpers/testDb');
  return { JobDetailsModel: createModelMock() };
});
vi.mock('../../../src/models/CompatibilityReview', async () => {
  const { createModelMock } = await import('../../helpers/testDb');
  return { CompatibilityReviewModel: createModelMock() };
});
vi.mock('../../../src/config/logger', () => ({ default: { info: vi.fn(), error: vi.fn() } }));
vi.mock('../../../src/utils/notify', () => ({ sendNotification: h.notify }));
vi.mock('../../../src/services/ApplicationCompatibilityService', () => ({ ApplicationCompatibilityService: {} }));
vi.mock('axios', () => ({ default: { post: h.post } }));

import { applicationService as svc } from '../../../src/services/applicationService';
import { JobDetailsModel } from '../../../src/models/JobDetails';
import { CompatibilityReviewModel } from '../../../src/models/CompatibilityReview';
import { ApiError } from '../../../src/utils/ApiError';
import { chain, jobDoc, OID, DocumentNotFoundError } from '../../helpers/testDb';

const J: any = JobDetailsModel;
const R: any = CompatibilityReviewModel;
const flush = () => new Promise((r) => setImmediate(r));
const cands = [
  { candidateId: 'c1', candidateName: 'Ann', candidateEmail: 'ann@x.com' },
  { candidateId: 'c2', candidateName: 'Bob', candidateEmail: 'bob@x.com' },
];

describe('applyToJob', () => {
  it('adds the application and notifies the recruiter', async () => {
    J.findById.mockReturnValue(chain(jobDoc({ applications: [{ candidateEmail: 'other@x.com' }] })));
    const updated = jobDoc();
    J.findByIdAndUpdate.mockReturnValue(chain(updated));
    await expect(svc.applyToJob(OID(1), 'ann@x.com', 'c1', 'Ann')).resolves.toBe(updated);
    const [id, update, opts] = J.findByIdAndUpdate.mock.calls[0];
    expect(id).toBe(OID(1));
    expect(update.$addToSet.applications).toMatchObject({ candidateEmail: 'ann@x.com', candidateId: 'c1', status: 'PENDING' });
    expect(opts).toEqual({ new: true });
    expect(h.notify).toHaveBeenCalledWith({
      recieverEmail: 'org@x.com', recieverId: 'user-1', type: 'new.job.application',
      title: 'New Job Application Recieved', message: 'Ann applied for the position of Backend Engineer',
    }, 'notifications');
  });

  it('works when the job has no applications array', async () => {
    J.findById.mockReturnValue(chain(jobDoc({ applications: undefined })));
    J.findByIdAndUpdate.mockReturnValue(chain(jobDoc()));
    await expect(svc.applyToJob(OID(1), 'a@x.com', 'c', 'n')).resolves.toBeDefined();
  });

  it('throws ApiError(400) when already applied', async () => {
    J.findById.mockReturnValue(chain(jobDoc({ applications: [{ candidateEmail: 'ann@x.com' }] })));
    const err: any = await svc.applyToJob(OID(1), 'ann@x.com', 'c1', 'Ann').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.statusCode).toBe(400);
    expect(J.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(h.notify).not.toHaveBeenCalled();
  });

  it('rejects when the job does not exist', async () => {
    J.findById.mockReturnValue(chain(null));
    await expect(svc.applyToJob(OID(1), 'a@x.com', 'c', 'n')).rejects.toBeInstanceOf(DocumentNotFoundError);
  });
});

describe('withdrawApplication', () => {
  it('pulls the application by email', async () => {
    J.findById.mockReturnValue(chain(jobDoc({ applications: [{ candidateEmail: 'ann@x.com' }] })));
    J.findByIdAndUpdate.mockReturnValue(chain({ ok: 1 }));
    await expect(svc.withdrawApplication(OID(1), 'ann@x.com', 'c1')).resolves.toEqual({ ok: 1 });
    expect(J.findByIdAndUpdate).toHaveBeenCalledWith(OID(1), { $pull: { applications: { candidateEmail: 'ann@x.com' } } }, { new: true });
  });
  it('throws ApiError(400) when the candidate never applied', async () => {
    J.findById.mockReturnValue(chain(jobDoc({ applications: [] })));
    const err: any = await svc.withdrawApplication(OID(1), 'ann@x.com', 'c1').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.statusCode).toBe(400);
  });
  it('treats an undefined applications array as not applied', async () => {
    J.findById.mockReturnValue(chain(jobDoc({ applications: undefined })));
    await expect(svc.withdrawApplication(OID(1), 'a', 'c')).rejects.toBeInstanceOf(ApiError);
  });
  it('rejects when the job is missing', async () => {
    J.findById.mockReturnValue(chain(null));
    await expect(svc.withdrawApplication(OID(1), 'a', 'c')).rejects.toBeInstanceOf(DocumentNotFoundError);
  });
});

describe.each([
  ['shortlistCandidate', 'SHORTLISTED'],
  ['finalizeCandidate', 'ACCEPTED'],
  ['rejectCandidate', 'REJECTED'],
] as const)('%s status update', (method, status) => {
  const call = (...a: any[]) => (method === 'rejectCandidate' ? (svc as any)[method](OID(1), 'PENDING', cands) : (svc as any)[method](OID(1), cands, ...a));

  it(`sets ${status} for the given candidate ids`, async () => {
    J.findOneAndUpdate.mockReturnValue(chain(jobDoc({ interviewQA: [] })));
    J.findById.mockReturnValue(chain(jobDoc()));
    R.findOne.mockResolvedValue(null);
    await call();
    expect(J.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: OID(1), 'applications.candidateId': { $in: ['c1', 'c2'] } },
      { $set: { 'applications.$[elem].status': status } },
      { new: true, arrayFilters: [{ 'elem.candidateId': { $in: ['c1', 'c2'] } }] },
    );
    await flush();
  });

  it('rejects when the job / applications do not match', async () => {
    J.findOneAndUpdate.mockReturnValue(chain(null));
    await expect(call()).rejects.toBeInstanceOf(DocumentNotFoundError);
    expect(h.notify).not.toHaveBeenCalled();
  });
});

describe('shortlistCandidate side effects', () => {
  it('sends interview invitations when the job has interview questions', async () => {
    J.findOneAndUpdate.mockReturnValue(chain(jobDoc({ interviewQA: [{ question: 'q' }] })));
    J.findById.mockReturnValue(chain(jobDoc({ interviewQA: [{ question: 'q' }] })));
    h.post.mockResolvedValue({ data: { data: { interviewId: 'iv1', deadline: '2030-01-01' } } });
    await svc.shortlistCandidate(OID(1), cands);
    await flush();
    expect(h.post).toHaveBeenCalledTimes(2);
    expect(h.notify).toHaveBeenCalledTimes(2);
  });
  it('skips invitations for jobs without interview questions', async () => {
    J.findOneAndUpdate.mockReturnValue(chain(jobDoc({ interviewQA: [] })));
    await svc.shortlistCandidate(OID(1), cands);
    await flush();
    expect(h.post).not.toHaveBeenCalled();
  });
});

describe('sendInterviewInvitation', () => {
  it('creates an interview per candidate and emails the link', async () => {
    const job = jobDoc({ interviewQA: [{ question: 'q', referenceAnswer: 'a' }] });
    J.findById.mockReturnValue(chain(job));
    h.post.mockResolvedValue({ data: { data: { interviewId: 'iv1', deadline: '2030-01-01' } } });
    await svc.sendInterviewInvitation(cands, OID(1));
    expect(h.post).toHaveBeenCalledTimes(2);
    const [url, body] = h.post.mock.calls[0];
    expect(url).toBe('http://interview.test/api/interview');
    expect(body).toMatchObject({
      candidate: { id: 'c1', email: 'ann@x.com', name: 'Ann' },
      job: { id: OID(1), title: 'Backend Engineer', interviewQA: job.interviewQA },
      organization: { id: 'org-1' },
    });
    expect(new Date(body.deadline).getTime()).toBeGreaterThan(Date.now() + 6 * 86400000);
    expect(h.notify).toHaveBeenCalledWith(expect.objectContaining({
      type: 'job.application.shortlisted', candidateEmail: 'ann@x.com', OrganizationName: 'Org',
      interviewLink: 'http://frontend.test/workspace/interviews/on-going/iv1',
    }), 'email-notification');
  });

  it('falls back for missing org name and interviewQA', async () => {
    J.findById.mockReturnValue(chain(jobDoc({ interviewQA: undefined, company: { OrganizationId: 'o', OrganizationEmail: 'e' } })));
    h.post.mockResolvedValue({ data: { data: { interviewId: 'iv', deadline: 'd' } } });
    await svc.sendInterviewInvitation([cands[0]], OID(1));
    expect(h.post.mock.calls[0][1].job.interviewQA).toEqual([]);
    expect(h.notify.mock.calls[0][0].OrganizationName).toBe(' No name Found ');
  });

  it('propagates interview-service failures and missing jobs', async () => {
    J.findById.mockReturnValue(chain(jobDoc()));
    h.post.mockRejectedValue(new Error('down'));
    await expect(svc.sendInterviewInvitation(cands, OID(1))).rejects.toThrow('down');
    J.findById.mockReturnValue(chain(null));
    await expect(svc.sendInterviewInvitation(cands, OID(1))).rejects.toBeInstanceOf(DocumentNotFoundError);
  });
});

describe('sendFinalistNotification', () => {
  it('emails every finalist', async () => {
    J.findById.mockReturnValue(chain(jobDoc()));
    await svc.sendFinalistNotification(cands, OID(1));
    expect(h.notify).toHaveBeenCalledTimes(2);
    expect(h.notify.mock.calls[1][0]).toMatchObject({ type: 'job.application.accepted', candidateEmail: 'bob@x.com', jobTitle: 'Backend Engineer' });
    expect(h.notify.mock.calls[1][1]).toBe('email-notification');
  });
  it('uses the placeholder org name when missing', async () => {
    J.findById.mockReturnValue(chain(jobDoc({ company: { OrganizationId: 'o', OrganizationEmail: 'e' } })));
    await svc.sendFinalistNotification([cands[0]], OID(1));
    expect(h.notify.mock.calls[0][0].OrganizationName).toBe(' No name Found ');
  });
  it('rejects for unknown job', async () => {
    J.findById.mockReturnValue(chain(null));
    await expect(svc.sendFinalistNotification(cands, OID(1))).rejects.toBeInstanceOf(DocumentNotFoundError);
  });
});

describe('sendRejectionNotification', () => {
  it('attaches the compatibility review and the stage', async () => {
    J.findById.mockReturnValue(chain(jobDoc({ interviewQA: [] })));
    R.findOne.mockResolvedValue({ _id: 'rev' });
    await svc.sendRejectionNotification(OID(1), 'PENDING', [cands[0]]);
    expect(R.findOne).toHaveBeenCalledWith({ jobId: OID(1), candidateEmail: 'ann@x.com' });
    expect(h.notify.mock.calls[0][0]).toMatchObject({
      type: 'job.application.rejected',
      data: { stage: 'Initial Stage', review: { _id: 'rev' }, interviewEvaluation: '' },
    });
  });
  it('adds the interview evaluation link only for SHORTLISTED rejections of jobs with interviews', async () => {
    J.findById.mockReturnValue(chain(jobDoc({ interviewQA: [{ question: 'q' }] })));
    R.findOne.mockResolvedValue(null);
    await svc.sendRejectionNotification(OID(1), 'SHORTLISTED', [cands[0]]);
    expect(h.notify.mock.calls[0][0].data.interviewEvaluation).toBe('http://frontend.test/workspace/interviews/all');
    await svc.sendRejectionNotification(OID(1), 'PENDING', [cands[0]]);
    expect(h.notify.mock.calls[1][0].data.interviewEvaluation).toBe('');
  });
  it('does not add the link when SHORTLISTED but the job has no interview questions', async () => {
    J.findById.mockReturnValue(chain(jobDoc({ interviewQA: [] })));
    R.findOne.mockResolvedValue(null);
    await svc.sendRejectionNotification(OID(1), 'SHORTLISTED', [cands[0]]);
    expect(h.notify.mock.calls[0][0].data.interviewEvaluation).toBe('');
  });
  it('handles undefined interviewQA and missing org name', async () => {
    J.findById.mockReturnValue(chain(jobDoc({ interviewQA: undefined, company: { OrganizationId: 'o', OrganizationEmail: 'e' } })));
    R.findOne.mockResolvedValue(null);
    await svc.sendRejectionNotification(OID(1), 'SHORTLISTED', [cands[0]]);
    expect(h.notify.mock.calls[0][0].OrganizationName).toBe(' No name Found ');
  });
  it('rejects for unknown job', async () => {
    J.findById.mockReturnValue(chain(null));
    await expect(svc.sendRejectionNotification(OID(1), 'X', cands)).rejects.toBeInstanceOf(DocumentNotFoundError);
  });
});
