import { describe, it, expect, vi, beforeEach } from 'vitest';

const h = vi.hoisted(() => ({
  uploadToCloudinary: vi.fn(), asynchronusTextProcesing: vi.fn(), analyzeResume: vi.fn(), updateResume: vi.fn(),
  extractDetailsFromJobDescription: vi.fn(), globalResumeSearch: vi.fn(), parseCandidateScores: vi.fn(),
  createResumeEmbeddings: vi.fn(), createJobEmbedding: vi.fn(),
  uploadResumeToQdrant: vi.fn(), filteredSearch: vi.fn(), getPointByResumeId: vi.fn(),
  axiosGet: vi.fn(),
}));

vi.mock('axios', () => ({ default: { get: h.axiosGet } }));
vi.mock('../../../src/services/resumeService', () => ({
  default: {
    uploadToCloudinary: h.uploadToCloudinary, asynchronusTextProcesing: h.asynchronusTextProcesing,
    analyzeResume: h.analyzeResume, updateResume: h.updateResume,
    extractDetailsFromJobDescription: h.extractDetailsFromJobDescription,
    globalResumeSearch: h.globalResumeSearch, parseCandidateScores: h.parseCandidateScores,
  },
}));
vi.mock('../../../src/services/OpenAIService', () => ({
  openAIService: { createResumeEmbeddings: h.createResumeEmbeddings, createJobEmbedding: h.createJobEmbedding },
}));
vi.mock('../../../src/services/QdrantService', () => ({
  qdrantService: { uploadResumeToQdrant: h.uploadResumeToQdrant, filteredSearch: h.filteredSearch, getPointByResumeId: h.getPointByResumeId },
}));

import controller from '../../../src/controllers/resumeController';
import Resume from '../../../src/models/Resume';
import { ExtractedResume } from '../../../src/models/ExtractedText';
import { invoke } from '../../helpers/httpMocks';
import { mockQuery, fakeDoc } from '../../helpers/testDb';

beforeEach(() => { Object.values(h).forEach((f) => f.mockReset()); vi.restoreAllMocks(); });

describe('uploadResumeToCloud', () => {
  const file = { buffer: Buffer.from('pdf') };
  const body = { userEmail: 'a@b.co', userId: 'user-1!' };

  it('errors with MissingRequiredFieldError when no file', async () => {
    const { error } = await invoke(controller.uploadResumeToCloud, { body });
    expect(error.message).toBe('Missing required field: file');
    expect(error.statusCode).toBe(400);
  });

  it('forwards a ZodError for an invalid body', async () => {
    const { error } = await invoke(controller.uploadResumeToCloud, { file, body: { userEmail: 'bad', userId: '' } });
    expect(error.name).toBe('ZodError');
  });

  it('uploads, kicks off async processing and returns the url', async () => {
    h.uploadToCloudinary.mockResolvedValue({ url: 'http://c/x.pdf' });
    const { status, body: out } = await invoke(controller.uploadResumeToCloud, { file, body });
    expect(h.uploadToCloudinary).toHaveBeenCalledWith(file.buffer, 'test-folder', 'user_1_');
    expect(h.asynchronusTextProcesing).toHaveBeenCalledWith('user-1!', 'a@b.co', file.buffer);
    expect(status).toBe(200);
    expect(out).toEqual({ success: true, data: { downloadUrl: 'http://c/x.pdf' } });
  });

  it('wraps upload failures in CloudinaryUploadError', async () => {
    h.uploadToCloudinary.mockRejectedValue(new Error('net'));
    const { error } = await invoke(controller.uploadResumeToCloud, { file, body });
    expect(error.name).toBe('CloudinaryUploadError');
    expect(error.message).toBe('Cloudinary upload failed: net');
    expect(h.asynchronusTextProcesing).not.toHaveBeenCalled();
  });
});

describe('extractDetailsFromResume', () => {
  const body = { resumeURL: 'http://x.com/r.pdf', userEmail: 'a@b.co', userId: 'u1' };

  it('analyzes stored text and returns a DTO enriched with request data', async () => {
    vi.spyOn(ExtractedResume, 'findOne').mockReturnValue(mockQuery({ text: 'resume text' }) as any);
    h.analyzeResume.mockResolvedValue({ industry: 'STEM & Technical', skills: { technical: ['ts'] }, wordCount: 2 });
    const { status, body: out } = await invoke(controller.extractDetailsFromResume, { body });
    expect(ExtractedResume.findOne).toHaveBeenCalledWith({ userId: 'u1' });
    expect(h.analyzeResume).toHaveBeenCalledWith('resume text');
    expect(status).toBe(200);
    expect(out.success).toBe(true);
    expect(out.data).toMatchObject({ fileLink: 'http://x.com/r.pdf', filename: 'resume_u1', uploadedBy: 'a@b.co', industry: 'STEM & Technical' });
    expect(out.data.contact.email).toBe('a@b.co');
  });

  it('forwards ZodError for an invalid URL', async () => {
    expect((await invoke(controller.extractDetailsFromResume, { body: { ...body, resumeURL: 'nope' } })).error.name).toBe('ZodError');
  });

  it('forwards not-found when no extracted text exists', async () => {
    vi.spyOn(ExtractedResume, 'findOne').mockReturnValue(mockQuery(null) as any);
    expect((await invoke(controller.extractDetailsFromResume, { body })).error.name).toBe('DocumentNotFoundError');
  });

  it('forwards analysis errors', async () => {
    vi.spyOn(ExtractedResume, 'findOne').mockReturnValue(mockQuery({ text: 't' }) as any);
    h.analyzeResume.mockRejectedValue(new Error('llm'));
    expect((await invoke(controller.extractDetailsFromResume, { body })).error.message).toBe('llm');
  });
});

describe('saveResume', () => {
  const req = () => ({ body: { resumeData: { filename: 'f' }, userId: 'u1', userName: 'Name', userEmail: 'a@b.co' } });
  const saved = { _id: { toString: () => 'rid' }, filename: 'f', uploadedBy: 'a@b.co', status: 'completed', industry: 'STEM & Technical' };

  it('saves, vectorizes and uploads to Qdrant', async () => {
    h.updateResume.mockResolvedValue(saved);
    h.createResumeEmbeddings.mockResolvedValue([{ section: 'skills', embedding: [1] }]);
    h.uploadResumeToQdrant.mockResolvedValue({});
    const r = req();
    const { status, body } = await invoke(controller.saveResume, r);
    expect(h.updateResume).toHaveBeenCalledWith({ filename: 'f', uploadedBy: 'a@b.co' }, 'u1');
    expect(h.uploadResumeToQdrant).toHaveBeenCalledWith([{ section: 'skills', embedding: [1] }],
      { id: 'u1', name: 'Name', email: 'a@b.co', industry: 'STEM & Technical', resumeId: 'rid' });
    expect(status).toBe(200);
    expect(body).toEqual({ success: true, message: 'Resume updated successfully', data: { id: saved._id, filename: 'f', status: 'completed' } });
  });

  it('defaults industry to "Others" and resumeId to userId when absent', async () => {
    h.updateResume.mockResolvedValue({ filename: 'f', status: 'completed' });
    h.createResumeEmbeddings.mockResolvedValue([]);
    await invoke(controller.saveResume, req());
    expect(h.uploadResumeToQdrant).toHaveBeenCalledWith([], expect.objectContaining({ industry: 'Others', resumeId: 'u1' }));
  });

  it('BUG: a missing resumeData crashes with a TypeError (uploadedBy assigned before the null check)', async () => {
    const { error } = await invoke(controller.saveResume, { body: { userId: 'u', userName: 'n', userEmail: 'e' } });
    expect(error).toBeInstanceOf(TypeError);
  });

  it('errors with ResumeNotFoundError when the service returns nothing', async () => {
    h.updateResume.mockResolvedValue(null);
    const { error } = await invoke(controller.saveResume, req());
    expect(error.name).toBe('ResumeNotFoundError');
  });

  it('wraps vector failures in VectorDbError', async () => {
    h.updateResume.mockResolvedValue(saved);
    h.createResumeEmbeddings.mockRejectedValue(new Error('embed'));
    const { error } = await invoke(controller.saveResume, req());
    expect(error.name).toBe('VectorDbError');
    expect(error.message).toBe('Vector database insert failed: embed');
  });

  it('forwards updateResume failures', async () => {
    h.updateResume.mockRejectedValue(new Error('db'));
    expect((await invoke(controller.saveResume, req())).error.message).toBe('db');
  });
});

describe('getResumeById', () => {
  it('returns the resume with a downloadUrl', async () => {
    vi.spyOn(Resume, 'findById').mockReturnValue(mockQuery(fakeDoc({ filename: 'f', fileLink: 'http://l' })) as any);
    const { status, body } = await invoke(controller.getResumeById, { params: { resumeId: 'id1' } });
    expect(Resume.findById).toHaveBeenCalledWith('id1');
    expect(status).toBe(200);
    expect(body.data).toEqual({ filename: 'f', fileLink: 'http://l', downloadUrl: 'http://l' });
  });
  it('errors on a missing id param', async () => {
    expect((await invoke(controller.getResumeById, { params: {} })).error.message).toBe('Missing required field: resumeId');
  });
  it('BUG: not-found surfaces as a generic DocumentNotFoundError (500) rather than ResumeNotFoundError (404)', async () => {
    vi.spyOn(Resume, 'findById').mockReturnValue(mockQuery(null) as any);
    const { error } = await invoke(controller.getResumeById, { params: { resumeId: 'id1' } });
    expect(error.name).toBe('DocumentNotFoundError');
    expect(error.statusCode).toBeUndefined();
  });
});

describe('getResumeByEmail', () => {
  it.each([[{}], [{ email: ['a', 'b'] }]])('errors for invalid email query %j', async (query) => {
    expect((await invoke(controller.getResumeByEmail, { query })).error.message).toBe('Missing required field: email');
  });
  it('errors when not found', async () => {
    vi.spyOn(Resume, 'findOne').mockReturnValue(mockQuery(null) as any);
    const { error } = await invoke(controller.getResumeByEmail, { query: { email: 'a@b.co' } });
    expect(error.name).toBe('ResumeNotFoundError');
    expect(error.message).toContain('email: a@b.co');
  });
  it('returns a DTO (even when DTO validation reports errors)', async () => {
    vi.spyOn(Resume, 'findOne').mockReturnValue(mockQuery(fakeDoc({ filename: 'f', fileLink: 'l', industry: 'STEM & Technical', skills: { technical: ['ts'] } })) as any);
    const { status, body } = await invoke(controller.getResumeByEmail, { query: { email: 'a@b.co' } });
    expect(status).toBe(200);
    expect(body.data).toMatchObject({ filename: 'f', fileLink: 'l', industry: 'STEM & Technical' });
    expect(body.data.skills.technical).toEqual(['ts']);
  });
  it('logs validation errors for incomplete resumes but still responds 200', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(Resume, 'findOne').mockReturnValue(mockQuery(fakeDoc({})) as any);
    const { status } = await invoke(controller.getResumeByEmail, { query: { email: 'a@b.co' } });
    expect(status).toBe(200);
    expect(errSpy).toHaveBeenCalledWith('Validation errors:', expect.arrayContaining(['filename is required']));
  });
});

describe('getUploadStatus', () => {
  it('reports service status', async () => {
    const { status, body } = await invoke(controller.getUploadStatus);
    expect(status).toBe(200);
    expect(body).toMatchObject({ success: true, service: 'evalia-ai-server', message: 'Resume upload service is running' });
    expect(new Date(body.timestamp).toString()).not.toBe('Invalid Date');
  });
});

describe('searchCandidatesUsingNLP', () => {
  it('errors without job_description', async () => {
    expect((await invoke(controller.searchCandidatesUsingNLP, { body: {}, params: { k: '3' } })).error.message).toBe('Missing required field: job_description');
  });
  it('extracts requirements and searches globally', async () => {
    h.extractDetailsFromJobDescription.mockResolvedValue({ industry: 'Others' });
    h.globalResumeSearch.mockResolvedValue([{ 'candidate-id': 'c1' }]);
    const { status, body } = await invoke(controller.searchCandidatesUsingNLP, { body: { job_description: 'jd' }, params: { k: '3' } });
    expect(h.globalResumeSearch).toHaveBeenCalledWith({ industry: 'Others' }, '3');
    expect(status).toBe(200);
    expect(body).toEqual({ success: true, message: 'Vector search completed successfully', data: [{ 'candidate-id': 'c1' }] });
  });
  it('forwards failures', async () => {
    h.extractDetailsFromJobDescription.mockRejectedValue(new Error('llm'));
    expect((await invoke(controller.searchCandidatesUsingNLP, { body: { job_description: 'jd' }, params: { k: '3' } })).error.message).toBe('llm');
  });
});

describe('generateAutomatedShortlist', () => {
  it('errors without jobId', async () => {
    expect((await invoke(controller.generateAutomatedShortlist, { params: { k: '3' } })).error.message).toBe('Missing required field: jobId');
  });
  it('fetches the job, embeds the (hardcoded) requirement, filters and scores', async () => {
    h.axiosGet.mockResolvedValue({ data: { data: { applications: [{ candidateId: 'c1' }, { candidateId: 'c2' }] } } });
    h.createJobEmbedding.mockResolvedValue([{ section: 'skills', embedding: [1] }]);
    h.filteredSearch.mockResolvedValue(['raw']);
    h.parseCandidateScores.mockReturnValue([{ 'candidate-id': 'c1' }]);
    const { status, body } = await invoke(controller.generateAutomatedShortlist, { params: { jobId: 'j1', k: '2' } });
    expect(h.axiosGet).toHaveBeenCalledWith('http://job-service.test/api/jobs/j1');
    expect(h.createJobEmbedding).toHaveBeenCalledWith(expect.stringContaining('Go, PostgreSQL'), expect.any(String), expect.any(String), expect.any(String));
    expect(h.filteredSearch).toHaveBeenCalledWith([{ section: 'skills', embedding: [1] }], ['c1', 'c2'], 2, 'resume-test');
    expect(status).toBe(200);
    expect(body.data).toEqual([{ 'candidate-id': 'c1' }]);
  });
  it('forwards job-service failures', async () => {
    h.axiosGet.mockRejectedValue(new Error('job svc down'));
    expect((await invoke(controller.generateAutomatedShortlist, { params: { jobId: 'j1', k: '2' } })).error.message).toBe('job svc down');
  });
});

describe('getResumePointById', () => {
  it('returns Qdrant data for the candidate', async () => {
    h.getPointByResumeId.mockResolvedValue({ skills: { vector: [1], payload: {} } });
    const { status, body } = await invoke(controller.getResumePointById, { params: { candidateId: 'c1' } });
    expect(h.getPointByResumeId).toHaveBeenCalledWith('c1');
    expect(status).toBe(200);
    expect(body).toEqual({ success: true, data: { skills: { vector: [1], payload: {} } } });
  });
  it('forwards failures', async () => {
    h.getPointByResumeId.mockRejectedValue(new Error('q'));
    expect((await invoke(controller.getResumePointById, { params: { candidateId: 'c1' } })).error.message).toBe('q');
  });
});
