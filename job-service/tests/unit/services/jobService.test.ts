import { describe, it, expect, vi } from 'vitest';

const h = vi.hoisted(() => ({
  notify: vi.fn(), findReview: vi.fn(), bot: vi.fn(), createJobEmbedding: vi.fn(), uploadJobToQdrant: vi.fn(),
}));
vi.mock('../../../src/models/JobDetails', async () => {
  const { createModelMock } = await import('../../helpers/testDb');
  return { JobDetailsModel: createModelMock() };
});
vi.mock('../../../src/config/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock('../../../src/utils/notify', () => ({ sendNotification: h.notify }));
vi.mock('../../../src/services/ApplicationCompatibilityService', () => ({
  ApplicationCompatibilityService: { findCompatibilityReview: h.findReview },
}));
vi.mock('../../../src/config/OpenRouter', () => ({ default: h.bot }));
vi.mock('../../../src/services/OpenAIService', () => ({ openAIService: { createJobEmbedding: h.createJobEmbedding } }));
vi.mock('../../../src/services/QdrantService', () => ({ qdrantService: { uploadJobToQdrant: h.uploadJobToQdrant } }));

import { JobService } from '../../../src/services/jobService';
import { JobDetailsModel } from '../../../src/models/JobDetails';
import { logger } from '../../../src/config/logger';
import { chain, jobDoc, OID, validCreateJobBody, DocumentNotFoundError } from '../../helpers/testDb';
import { CreateJobRequestSchema } from '../../../src/types/job.types';

const M: any = JobDetailsModel;
const flush = () => new Promise((r) => setImmediate(r));

describe('JobService.createJob', () => {
  it('maps the payload, saves and returns the document', async () => {
    const saved = jobDoc();
    M.saveMock.mockResolvedValue(saved);
    const payload = CreateJobRequestSchema.parse(validCreateJobBody());
    await expect(JobService.createJob(payload)).resolves.toBe(saved);
    expect(M.ctor).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Backend Engineer', status: 'ACTIVE', postedBy: 'user-1',
    }));
    expect(logger.info).toHaveBeenCalledWith('New job created successfully', expect.objectContaining({ jobId: OID(1), company: 'org-1' }));
  });

  it('propagates save errors', async () => {
    M.saveMock.mockRejectedValue(new Error('db'));
    await expect(JobService.createJob(CreateJobRequestSchema.parse(validCreateJobBody()))).rejects.toThrow('db');
  });
});

describe('JobService.findJobById', () => {
  it('returns the job and fires a (lazy) view increment', async () => {
    const job = jobDoc({ views: 4 });
    M.findById.mockReturnValue(chain(job));
    M.findByIdAndUpdate.mockReturnValue(chain(job));
    await expect(JobService.findJobById('id1')).resolves.toBe(job);
    expect(M.findByIdAndUpdate).toHaveBeenCalledWith('id1', { $inc: { views: 1 } });
    expect(logger.info).toHaveBeenCalledWith('Job details retrieved', { jobId: OID(1), views: 5 });
  });

  it('rejects with DocumentNotFoundError when missing', async () => {
    M.findById.mockReturnValue(chain(null));
    await expect(JobService.findJobById('id1')).rejects.toBeInstanceOf(DocumentNotFoundError);
    expect(M.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('BUG: view increment query is never executed (no await/exec/then on it)', async () => {
    M.findById.mockReturnValue(chain(jobDoc()));
    const q = chain(jobDoc());
    const exec = vi.spyOn(q, 'exec');
    const then = vi.spyOn(q, 'then');
    M.findByIdAndUpdate.mockReturnValue(q);
    await JobService.findJobById('id1');
    expect(exec).not.toHaveBeenCalled();
    expect(then).not.toHaveBeenCalled();
  });
});

describe('JobService.getJobsByCompany', () => {
  it('paginates, sorts newest first and reports page info', async () => {
    const q = chain([{ a: 1 }, { a: 2 }]);
    M.find.mockReturnValue(q);
    M.countDocuments.mockResolvedValue(25);
    const res = await JobService.getJobsByCompany('org', 2, 10);
    expect(M.find).toHaveBeenCalledWith({ 'company.OrganizationId': 'org' });
    expect(q.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(q.skip).toHaveBeenCalledWith(10);
    expect(q.limit).toHaveBeenCalledWith(10);
    expect(res.pagination).toEqual({ currentPage: 2, totalPages: 3, totalCount: 25, hasNextPage: true, hasPrevPage: true, limit: 10 });
    expect(res.jobs).toHaveLength(2);
  });

  it('uses defaults (page 1, limit 10) and flags last page', async () => {
    M.find.mockReturnValue(chain([]));
    M.countDocuments.mockResolvedValue(5);
    const { pagination } = await JobService.getJobsByCompany('org');
    expect(pagination).toMatchObject({ currentPage: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false });
  });
});

describe('JobService.bulkJobDelete / deleteJobByJobId', () => {
  it('soft-deletes via updateMany (BUG: filters on "organization.id", not company.OrganizationId)', async () => {
    M.updateMany.mockReturnValue(chain({ modifiedCount: 3 }));
    await expect(JobService.bulkJobDelete('org')).resolves.toEqual({ modifiedCount: 3 });
    expect(M.updateMany).toHaveBeenCalledWith({ 'organization.id': 'org' }, { $set: { status: 'DELETED' } });
  });
  it('bulk delete rejects when orFail finds nothing', async () => {
    M.updateMany.mockReturnValue(chain(null));
    await expect(JobService.bulkJobDelete('org')).rejects.toBeInstanceOf(DocumentNotFoundError);
  });
  it('deleteJobByJobId returns the deleted doc or rejects', async () => {
    M.findByIdAndDelete.mockReturnValue(chain({ _id: 'x' }));
    await expect(JobService.deleteJobByJobId('x')).resolves.toEqual({ _id: 'x' });
    M.findByIdAndDelete.mockReturnValue(chain(null));
    await expect(JobService.deleteJobByJobId('x')).rejects.toBeInstanceOf(DocumentNotFoundError);
  });
});

describe('JobService.bulkRejectApplications', () => {
  const jobId = OID(5);
  const apps = [
    { status: 'PENDING', candidateName: 'A', candidateEmail: 'a@x.com' },
    { status: 'SHORTLISTED', candidateName: 'B', candidateEmail: 'b@x.com' },
    { status: 'PENDING', candidateName: 'C', candidateEmail: 'c@x.com' },
  ];

  it('rejects an invalid ObjectId without touching the DB', async () => {
    await expect(JobService.bulkRejectApplications('nope', 'PENDING')).resolves.toEqual({ success: false, error: 'Invalid job ID' });
    expect(M.findOne).not.toHaveBeenCalled();
  });

  it('marks matching applications REJECTED and notifies each candidate', async () => {
    M.findOne.mockReturnValue(chain({ title: 'Dev', applications: apps }));
    M.updateOne.mockResolvedValue({});
    h.findReview.mockResolvedValue({ _id: 'rev' });
    const res = await JobService.bulkRejectApplications(jobId, 'PENDING');
    expect(res).toEqual({ success: true, message: "Rejected 2 applications with status 'PENDING'", data: { jobId, updatedCount: 2 } });
    expect(M.updateOne).toHaveBeenCalledWith(
      { _id: jobId },
      { $set: { 'applications.$[elem].status': 'REJECTED' } },
      { arrayFilters: [{ 'elem.status': 'PENDING' }] },
    );
    await flush();
    expect(h.notify).toHaveBeenCalledTimes(2);
    expect(h.notify).toHaveBeenCalledWith(expect.objectContaining({
      candidateEmail: 'a@x.com', type: 'job.application.rejected', jobTitle: 'Dev', jobId, stage: 'PENDING',
      compatibility_review: { _id: 'rev' },
    }), 'email-notifications');
  });

  it('logs async notification errors but still reports success', async () => {
    M.findOne.mockReturnValue(chain({ title: 'Dev', applications: apps }));
    M.updateOne.mockResolvedValue({});
    h.findReview.mockRejectedValue(new Error('review fail'));
    const res = await JobService.bulkRejectApplications(jobId, 'PENDING');
    expect(res.success).toBe(true);
    await flush();
    expect(logger.error).toHaveBeenCalledWith('Error in async notification processing', { error: 'review fail', jobId });
    expect(h.notify).not.toHaveBeenCalled();
  });

  it('returns a generic failure when the job is missing', async () => {
    M.findOne.mockReturnValue(chain(null));
    await expect(JobService.bulkRejectApplications(jobId, 'PENDING')).resolves.toEqual({
      success: false, error: 'Internal server error while rejecting candidates',
    });
  });
});

describe('JobService.findJobsByIds', () => {
  it('drops invalid ids and converts valid ones to ObjectIds', async () => {
    M.find.mockResolvedValue([{ _id: 1 }]);
    const res = await JobService.findJobsByIds([OID(1), 'bad', OID(2)]);
    expect(res).toHaveLength(1);
    const q = M.find.mock.calls[0][0];
    expect(q._id.$in.map(String)).toEqual([OID(1), OID(2)]);
  });
});

describe('JobService.addReviewIdToApplication', () => {
  const id = OID(9);
  it('rejects invalid job ids', async () => {
    await expect(JobService.addReviewIdToApplication('bad', 'r', 'a@b.c')).rejects.toThrow('Invalid job ID format');
    expect(logger.error).toHaveBeenCalled();
  });
  it.each(['', 'no-at-sign', undefined, 5])('rejects invalid email %j', async (email: any) => {
    await expect(JobService.addReviewIdToApplication(id, 'r', email)).rejects.toThrow('Invalid email format');
  });
  it('throws when no application matched', async () => {
    M.updateOne.mockResolvedValue({ matchedCount: 0, modifiedCount: 0 });
    await expect(JobService.addReviewIdToApplication(id, 'r', 'a@b.c')).rejects.toThrow(/not found/);
  });
  it('warns when matched but not modified', async () => {
    M.updateOne.mockResolvedValue({ matchedCount: 1, modifiedCount: 0 });
    await JobService.addReviewIdToApplication(id, 'r', 'a@b.c');
    expect(logger.warn).toHaveBeenCalledWith('No application was modified', expect.any(Object));
  });
  it('sets the reviewId on the right application', async () => {
    M.updateOne.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });
    await JobService.addReviewIdToApplication(id, 'rev1', 'a@b.c');
    expect(M.updateOne).toHaveBeenCalledWith(
      { _id: id, 'applications.candidateEmail': 'a@b.c' },
      { $set: { 'applications.$.reviewId': 'rev1' } },
    );
    expect(logger.info).toHaveBeenCalledWith('Review ID added to application successfully', expect.any(Object));
  });
});

describe('JobService.fetchInterviewQuestions / fetchJobDescription', () => {
  it('returns just the questions', async () => {
    M.findOne.mockReturnValue(chain({ interviewQA: [{ question: 'q1', referenceAnswer: 'a' }, { question: 'q2' }] }));
    await expect(JobService.fetchInterviewQuestions('j')).resolves.toEqual(['q1', 'q2']);
    expect(M.findOne).toHaveBeenCalledWith({ _id: 'j' }, 'interviewQA');
  });
  it('returns undefined when interviewQA is absent', async () => {
    M.findOne.mockReturnValue(chain({}));
    await expect(JobService.fetchInterviewQuestions('j')).resolves.toBeUndefined();
  });
  it('rejects when the job is missing', async () => {
    M.findOne.mockReturnValue(chain(null));
    await expect(JobService.fetchInterviewQuestions('j')).rejects.toBeInstanceOf(DocumentNotFoundError);
  });
  it('fetchJobDescription returns the description or undefined', async () => {
    M.findOne.mockResolvedValue({ jobDescription: 'desc' });
    await expect(JobService.fetchJobDescription('j')).resolves.toBe('desc');
    M.findOne.mockResolvedValue(null);
    await expect(JobService.fetchJobDescription('j')).resolves.toBeUndefined();
  });
});

describe('JobService.uploadJobToVectorDB', () => {
  const parsed = { industry: 'STEM & Technical', skills: 's', experience: 'e', projects: 'p', education: 'ed' };

  it('extracts requirements with the LLM, embeds and uploads to Qdrant', async () => {
    h.bot.mockResolvedValue(JSON.stringify(parsed));
    h.createJobEmbedding.mockResolvedValue([{ section: 'skills', embedding: [1] }]);
    h.uploadJobToQdrant.mockResolvedValue({});
    await JobService.uploadJobToVectorDB(jobDoc() as any);
    const prompt = h.bot.mock.calls[0][0];
    for (const t of ['Build APIs', 'TypeScript', 'Write code', 'Node']) expect(prompt).toContain(t);
    expect(h.createJobEmbedding).toHaveBeenCalledWith('s', 'e', 'p', 'ed');
    expect(h.uploadJobToQdrant).toHaveBeenCalledWith([{ section: 'skills', embedding: [1] }], {
      id: OID(1), industry: 'STEM & Technical', organizationId: 'org-1',
    });
  });

  it('fails on invalid JSON from the LLM and uploads nothing', async () => {
    h.bot.mockResolvedValue('garbage');
    await expect(JobService.uploadJobToVectorDB(jobDoc() as any)).rejects.toThrow();
    expect(h.uploadJobToQdrant).not.toHaveBeenCalled();
  });
});

describe('JobService.parseJobScores', () => {
  const pt = (id: any, score: number, extra: any = {}) => ({ id: 1, version: 1, score, payload: id === undefined ? extra : { 'document-id': id, ...extra } });

  it('returns [] for empty input', () => {
    expect(JobService.parseJobScores([])).toEqual([]);
  });

  it('merges per-section scores by job id, rounding to 2 decimals', () => {
    const out = JobService.parseJobScores([
      { section: 'skills', result: { points: [pt('j1', 0.8765, { industry: 'STEM', is_active: true }), pt('j2', 0.5)] } },
      { section: 'education', result: { points: [pt('j1', 0.111)] } },
      { section: 'experience', result: { points: [pt('j1', 0.999), pt('j2', 0.2)] } },
      { section: 'projects', result: { points: [pt('j2', 0.333)] } },
    ] as any);
    expect(out).toEqual([
      { jobId: 'j1', industry: 'STEM', isActive: true, skills: 0.88, education: 0.11, experience: 1, projects: null },
      { jobId: 'j2', industry: null, isActive: null, skills: 0.5, education: null, experience: 0.2, projects: 0.33 },
    ]);
  });

  it('skips points with missing / non-string document ids and ignores unknown sections', () => {
    const out = JobService.parseJobScores([
      { section: 'skills', result: { points: [pt(undefined, 0.5), pt(123, 0.5), { id: 1, version: 1, score: 1, payload: null }, pt('j1', 0.4)] } },
      { section: 'other', result: { points: [pt('j1', 0.9)] } },
    ] as any);
    expect(out).toEqual([{ jobId: 'j1', industry: null, isActive: null, skills: 0.4, education: null, experience: null, projects: null }]);
  });
});
