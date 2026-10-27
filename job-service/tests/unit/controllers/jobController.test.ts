import { describe, it, expect, vi } from 'vitest';

const h = vi.hoisted(() => ({
  get: vi.fn(), bot: vi.fn(), globalSearch: vi.fn(),
  createJob: vi.fn(), uploadVec: vi.fn(), findJob: vi.fn(), getByCompany: vi.fn(), bulkDelete: vi.fn(),
  deleteJob: vi.fn(), findByIds: vi.fn(), fetchQ: vi.fn(), fetchDesc: vi.fn(), parseScores: vi.fn(),
}));
vi.mock('axios', () => ({ default: { get: h.get } }));
vi.mock('../../../src/models/JobDetails', async () => {
  const { createModelMock } = await import('../../helpers/testDb');
  return { JobDetailsModel: createModelMock() };
});
vi.mock('../../../src/config/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock('../../../src/config/OpenRouter', () => ({ default: h.bot }));
vi.mock('../../../src/services/QdrantService', () => ({ qdrantService: { globalJobSearchUsingResume: h.globalSearch } }));
vi.mock('../../../src/services/jobService', () => ({
  JobService: {
    createJob: h.createJob, uploadJobToVectorDB: h.uploadVec, findJobById: h.findJob,
    getJobsByCompany: h.getByCompany, bulkJobDelete: h.bulkDelete, deleteJobByJobId: h.deleteJob,
    findJobsByIds: h.findByIds, fetchInterviewQuestions: h.fetchQ, fetchJobDescription: h.fetchDesc,
    parseJobScores: h.parseScores,
  },
}));

import { jobController as ctrl, JobController } from '../../../src/controllers/jobController';
import { JobDetailsModel } from '../../../src/models/JobDetails';
import { ApiError } from '../../../src/utils/ApiError';
import { chain, invoke, OID, validCreateJobBody, DocumentNotFoundError } from '../../helpers/testDb';

const M: any = JobDetailsModel;

describe('createJob', () => {
  it('400 with details on validation failure', async () => {
    const { res } = await invoke(ctrl.createJob, { body: { createdBy: 'x' } });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0]).toMatchObject({ success: false, error: 'Validation failed' });
    expect(res.json.mock.calls[0][0].details.length).toBeGreaterThan(0);
    expect(h.createJob).not.toHaveBeenCalled();
  });
  it('rejects salaryTo < salaryFrom', async () => {
    const b = validCreateJobBody();
    b.basic.salaryTo = 1;
    const { res } = await invoke(ctrl.createJob, { body: b });
    expect(res.status).toHaveBeenCalledWith(400);
  });
  it('creates the job, uploads it to the vector DB and returns it', async () => {
    h.createJob.mockResolvedValue({ _id: 'j' });
    h.uploadVec.mockResolvedValue(undefined);
    const { res } = await invoke(ctrl.createJob, { body: validCreateJobBody() });
    expect(h.uploadVec).toHaveBeenCalledWith({ _id: 'j' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { _id: 'j' } });
  });
  it('forwards a vector-DB failure after the job was saved', async () => {
    h.createJob.mockResolvedValue({ _id: 'j' });
    h.uploadVec.mockRejectedValue(new Error('qdrant'));
    const { next, res } = await invoke(ctrl.createJob, { body: validCreateJobBody() });
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'qdrant' }));
    expect(res.json).not.toHaveBeenCalled();
  });
});

describe('getJobById', () => {
  it('returns the job', async () => {
    h.findJob.mockResolvedValue({ _id: OID(1) });
    const { res } = await invoke(ctrl.getJobById, { params: { jobId: OID(1) } });
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { _id: OID(1) } });
  });
  it('forwards ZodError for a malformed id', async () => {
    const { next } = await invoke(ctrl.getJobById, { params: { jobId: 'bad' } });
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'ZodError' }));
  });
});

describe('getAllJobsOfAnOrganization', () => {
  it('400 without organization id', async () => {
    const { res } = await invoke(ctrl.getAllJobsOfAnOrganization, { params: {} });
    expect(res.status).toHaveBeenCalledWith(400);
  });
  it('passes parsed pagination and returns the jobs', async () => {
    h.getByCompany.mockResolvedValue({ jobs: [1], pagination: { p: 1 } });
    const { res } = await invoke(ctrl.getAllJobsOfAnOrganization, { params: { OrganizationId: 'o' }, query: { page: '3', limit: '5' } });
    expect(h.getByCompany).toHaveBeenCalledWith('o', 3, 5);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Jobs retrieved successfully for company ID: o', data: { jobs: [1], pagination: { p: 1 } } });
  });
  it('defaults page/limit when absent or not numeric', async () => {
    h.getByCompany.mockResolvedValue({ jobs: [], pagination: {} });
    await invoke(ctrl.getAllJobsOfAnOrganization, { params: { OrganizationId: 'o' }, query: { page: 'x' } });
    expect(h.getByCompany).toHaveBeenCalledWith('o', 1, 10);
  });
});

describe('deleteAllJobsOfAnOrganization', () => {
  it('400 without organization id', async () => {
    const { res } = await invoke(ctrl.deleteAllJobsOfAnOrganization, { params: {} });
    expect(res.status).toHaveBeenCalledWith(400);
  });
  it('bulk deletes', async () => {
    h.bulkDelete.mockResolvedValue({ modifiedCount: 2 });
    const { res } = await invoke(ctrl.deleteAllJobsOfAnOrganization, { params: { OrganizationId: 'o' } });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { modifiedCount: 2 } });
  });
});

describe('getAllJobs', () => {
  it('400 for invalid query params', async () => {
    const { res } = await invoke(ctrl.getAllJobs, { query: { status: 'WRONG', limit: '1000' } });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].error).toBe('Invalid query parameters');
    expect(res.json.mock.calls[0][0].details.length).toBe(2);
  });

  it('uses defaults and returns pagination', async () => {
    const q = chain([{ a: 1 }]);
    M.find.mockReturnValue(q);
    M.countDocuments.mockResolvedValue(1);
    const { res } = await invoke(ctrl.getAllJobs, { query: {} });
    expect(M.find).toHaveBeenCalledWith({});
    expect(q.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(q.skip).toHaveBeenCalledWith(0);
    expect(q.limit).toHaveBeenCalledWith(10);
    expect(res.json.mock.calls[0][0].data.pagination).toEqual({ currentPage: 1, totalPages: 1, totalCount: 1, hasNextPage: false, hasPrevPage: false, limit: 10 });
  });

  it('applies status filter, asc sort and paging', async () => {
    const q = chain([]);
    M.find.mockReturnValue(q);
    M.countDocuments.mockResolvedValue(45);
    const { res } = await invoke(ctrl.getAllJobs, { query: { status: 'ACTIVE', page: '2', limit: '20', sortBy: 'title', sortOrder: 'asc' } });
    expect(M.find).toHaveBeenCalledWith({ status: 'ACTIVE' });
    expect(M.countDocuments).toHaveBeenCalledWith({ status: 'ACTIVE' });
    expect(q.sort).toHaveBeenCalledWith({ title: 1 });
    expect(q.skip).toHaveBeenCalledWith(20);
    expect(res.json.mock.calls[0][0].data.pagination).toMatchObject({ currentPage: 2, totalPages: 3, hasNextPage: true, hasPrevPage: true });
  });
});

describe('updateJobStatus', () => {
  it('400 for an invalid status', async () => {
    const { res } = await invoke(ctrl.updateJobStatus, { params: { jobId: 'j' }, body: { status: 'WHATEVER' } });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].error).toContain('DRAFT, ACTIVE, FILLED, ARCHIVED, DELETED');
  });
  it('updates and returns the new status', async () => {
    M.findByIdAndUpdate.mockReturnValue(chain({ _id: 'j', status: 'FILLED' }));
    const { res } = await invoke(ctrl.updateJobStatus, { params: { jobId: 'j' }, body: { status: 'FILLED' } });
    expect(M.findByIdAndUpdate).toHaveBeenCalledWith('j', { status: 'FILLED' }, { new: true, runValidators: true });
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Job status updated successfully', data: { jobId: 'j', status: 'FILLED' } });
  });
  it('forwards not-found', async () => {
    M.findByIdAndUpdate.mockReturnValue(chain(null));
    const { next } = await invoke(ctrl.updateJobStatus, { params: { jobId: 'j' }, body: { status: 'FILLED' } });
    expect(next).toHaveBeenCalledWith(expect.any(DocumentNotFoundError));
  });
});

describe('deleteJob', () => {
  it('deletes and responds', async () => {
    h.deleteJob.mockResolvedValue({ _id: 'j' });
    const { res } = await invoke(ctrl.deleteJob, { params: { jobId: 'j' } });
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Job deleted successfully', data: { _id: 'j' } });
  });
});

describe.each([
  ['fetchBatchJobInfo', true],
  ['getAllJobsSavedByAUser', false],
] as const)('%s', (method, requiresOne) => {
  it('400 when the body is not an array', async () => {
    const { res } = await invoke((ctrl as any)[method], { body: { a: 1 } });
    expect(res.status).toHaveBeenCalledWith(400);
  });
  it('400 for malformed ids', async () => {
    const { res } = await invoke((ctrl as any)[method], { body: ['bad'] });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].details[0]).toContain('Invalid job ID format');
  });
  it('400 for more than 100 ids', async () => {
    const { res } = await invoke((ctrl as any)[method], { body: Array(101).fill(OID(1)) });
    expect(res.status).toHaveBeenCalledWith(400);
  });
  it(requiresOne ? '400 for an empty array' : 'accepts an empty array', async () => {
    h.findByIds.mockResolvedValue([]);
    const { res } = await invoke((ctrl as any)[method], { body: [] });
    expect(res.status).toHaveBeenCalledWith(requiresOne ? 400 : 200);
  });
  it('returns the jobs', async () => {
    h.findByIds.mockResolvedValue([{ a: 1 }, { a: 2 }]);
    const { res } = await invoke((ctrl as any)[method], { body: [OID(1), OID(2)] });
    expect(h.findByIds).toHaveBeenCalledWith([OID(1), OID(2)]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Retrieved 2 job details', data: [{ a: 1 }, { a: 2 }] });
  });
});

describe('getInterviewQuestionsOfAJob / getDescriptionOfAJob', () => {
  it('returns questions with a count message', async () => {
    h.fetchQ.mockResolvedValue(['q1', 'q2']);
    const { res } = await invoke(ctrl.getInterviewQuestionsOfAJob, { params: { jobId: 'j' } });
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Retrieved 2 Questions for interview', data: ['q1', 'q2'] });
  });
  it('handles undefined questions', async () => {
    h.fetchQ.mockResolvedValue(undefined);
    const { res } = await invoke(ctrl.getInterviewQuestionsOfAJob, { params: { jobId: 'j' } });
    expect(res.json.mock.calls[0][0].message).toBe('Retrieved undefined Questions for interview');
  });
  it('returns the description', async () => {
    h.fetchDesc.mockResolvedValue('desc');
    const { res } = await invoke(ctrl.getDescriptionOfAJob, { params: { jobId: 'j' } });
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Retrieved Job Description', data: 'desc' });
  });
});

describe('generateInterviewQuestions', () => {
  it('400 when jobDescription is missing', async () => {
    const { res } = await invoke(ctrl.generateInterviewQuestions, { body: {} });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(h.bot).not.toHaveBeenCalled();
  });
  it('prompts the LLM and returns parsed JSON', async () => {
    h.bot.mockResolvedValue('{"questions":[{"question":"q","referenceAnswer":"a"}]}');
    const { res } = await invoke(ctrl.generateInterviewQuestions, {
      body: { jobDescription: 'DESCRIPTION', skills: [{ type: 'high', category: 'c', description: 'd' }] },
    });
    expect(h.bot.mock.calls[0][0]).toContain('DESCRIPTION');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { questions: [{ question: 'q', referenceAnswer: 'a' }] } });
  });
  it('forwards a SyntaxError when the LLM returns invalid JSON', async () => {
    h.bot.mockResolvedValue('nope');
    const { next } = await invoke(ctrl.generateInterviewQuestions, { body: { jobDescription: 'd' } });
    expect(next).toHaveBeenCalledWith(expect.any(SyntaxError));
  });
});

describe('getJobSuggestions', () => {
  it('fetches the resume vector, searches Qdrant and maps scores', async () => {
    h.get.mockResolvedValue({ data: { data: { skills: { vector: [1], payload: {} } } } });
    h.globalSearch.mockResolvedValue(['raw']);
    h.parseScores.mockReturnValue([{ jobId: 'j1' }]);
    const { res } = await invoke(ctrl.getJobSuggestions, { params: { candidateId: 'c1' } });
    expect(h.get).toHaveBeenCalledWith('http://resume.test/api/resume/c1/vector');
    expect(h.globalSearch).toHaveBeenCalledWith({ skills: { vector: [1], payload: {} } }, 10, 'jobs-test');
    expect(h.parseScores).toHaveBeenCalledWith(['raw']);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ jobId: 'j1' }] });
  });
  it('forwards ApiError(400) when the resume service has no vector', async () => {
    h.get.mockResolvedValue({ data: { data: null } });
    const { next } = await invoke(ctrl.getJobSuggestions, { params: { candidateId: 'c1' } });
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(ApiError);
    expect(err.statusCode).toBe(400);
    expect(h.globalSearch).not.toHaveBeenCalled();
  });
  it('forwards resume-service failures', async () => {
    h.get.mockRejectedValue(new Error('down'));
    const { next } = await invoke(ctrl.getJobSuggestions, { params: { candidateId: 'c1' } });
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'down' }));
  });
});

it('exports the singleton instance', () => {
  expect(ctrl).toBeInstanceOf(JobController);
});
