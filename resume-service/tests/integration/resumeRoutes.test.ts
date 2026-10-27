import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';

vi.mock('openai', async () => (await import('../mocks/externals')).openaiModule);
vi.mock('@qdrant/js-client-rest', async () => (await import('../mocks/externals')).qdrantModule);
vi.mock('cloudinary', async () => (await import('../mocks/externals')).cloudinaryModule);
vi.mock('pdf-parse', async () => (await import('../mocks/externals')).pdfParseModule);
vi.mock('axios', async () => (await import('../mocks/externals')).axiosModule);

import { ext, resetExternals, llmReply, sampleParsedResume, getApp, mockQuery, fakeDoc } from '../helpers/integration';
import Resume from '../../src/models/Resume';
import { ExtractedResume } from '../../src/models/ExtractedText';
import { SavedCourse } from '../../src/models/SavedCourseSchema';

let app: Application;
beforeAll(async () => { app = await getApp(); });
beforeEach(() => { resetExternals(); vi.restoreAllMocks(); vi.spyOn(console, 'log').mockImplementation(() => {}); vi.spyOn(console, 'error').mockImplementation(() => {}); });

const pdf = Buffer.from('%PDF-1.4 resume');
const point = (id: string, score: number, name = 'Ann') => ({ id: 1, version: 1, score, payload: { 'candidate-id': id, 'candidate-name': name } });

describe('POST /api/resume/upload', () => {
  it('uploads to Cloudinary, returns the url and processes text in the background', async () => {
    const save = vi.spyOn(ExtractedResume.prototype, 'save').mockResolvedValue(undefined as any);
    const res = await request(app).post('/api/resume/upload')
      .field('userEmail', 'john@example.com').field('userId', 'user-42')
      .attach('file', pdf, { filename: 'cv.pdf', contentType: 'application/pdf' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: { downloadUrl: 'http://res.cloudinary.test/x.pdf' } });
    expect(ext.cloudinaryUploadStream.mock.calls[0][0]).toMatchObject({ folder: 'test-folder', public_id: 'user_42.pdf', resource_type: 'raw' });
    await vi.waitFor(() => expect(save).toHaveBeenCalled());
    expect(ext.pdfParse).toHaveBeenCalledWith(expect.any(Buffer));
  });
});

describe('POST /api/resume/extract', () => {
  it('parses the stored text through the LLM and returns a resume DTO', async () => {
    vi.spyOn(ExtractedResume, 'findOne').mockReturnValue(mockQuery({ text: 'John Doe john@example.com' }) as any);
    ext.openaiChatCreate.mockResolvedValue(llmReply('```json\n' + JSON.stringify(sampleParsedResume) + '\n```'));
    const res = await request(app).post('/api/resume/extract').send({ resumeURL: 'https://res.cloudinary.test/x.pdf', userEmail: 'john@example.com', userId: 'u1' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      fileLink: 'https://res.cloudinary.test/x.pdf', filename: 'resume_u1', uploadedBy: 'john@example.com',
      industry: 'STEM & Technical', skills: { technical: ['TypeScript'] },
    });
    expect(res.body.data.contact.email).toBe('john@example.com');
    expect(ext.openaiChatCreate.mock.calls[0][0].messages[0].content).toContain('John Doe john@example.com');
  });

  it('500s when the LLM returns invalid JSON', async () => {
    vi.spyOn(ExtractedResume, 'findOne').mockReturnValue(mockQuery({ text: 't' }) as any);
    ext.openaiChatCreate.mockResolvedValue(llmReply('sorry, I cannot'));
    const res = await request(app).post('/api/resume/extract').send({ resumeURL: 'https://x.com/a.pdf', userEmail: 'e', userId: 'u' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/resume/save', () => {
  const body = { resumeData: { filename: 'cv.pdf', fileLink: 'https://x.com/cv.pdf', industry: 'STEM & Technical', skills: { technical: ['TypeScript'] },
    experience: [{ job_title: 'Dev', company: 'ACME', description: ['x'] }], education: [{ degree: 'BSc', institution: 'MIT' }],
    projects: [{ title: 'P', description: 'D' }] }, userId: 'u1', userName: 'John', userEmail: 'john@example.com' };

  it('creates the resume, embeds all sections and upserts them in Qdrant', async () => {
    vi.spyOn(Resume, 'findOne').mockReturnValue(mockQuery(null) as any);
    vi.spyOn(Resume.prototype, 'save').mockImplementation(async function (this: any) { return this; });
    ext.qdrantUpsert.mockResolvedValue({ status: 'completed', operation_id: 1 });
    const res = await request(app).post('/api/resume/save').send(body);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, message: 'Resume updated successfully', data: { filename: 'cv.pdf', status: 'processing' } });
    expect(ext.openaiEmbeddingsCreate).toHaveBeenCalledTimes(4);
    const [collection, payload] = ext.qdrantUpsert.mock.calls[0];
    expect(collection).toBe('resume');
    expect(payload.points.map((p: any) => p.payload.section).sort()).toEqual(['education', 'experience', 'project', 'skills']);
    expect(payload.points[0].payload).toMatchObject({ 'candidate-id': 'u1', 'candidate-email': 'john@example.com', 'candidate-name': 'John', industry: 'STEM & Technical' });
  });

  it('updates an existing resume and clears its old vectors first', async () => {
    const existing = fakeDoc({ filename: 'old', uploadedBy: 'john@example.com', status: 'completed', _id: 'rid' });
    vi.spyOn(Resume, 'findOne').mockReturnValue(mockQuery(existing) as any);
    ext.qdrantQuery.mockResolvedValue({ points: [{ id: 'old' }] });
    ext.qdrantDelete.mockResolvedValue({ status: 'completed', operation_id: 2 });
    ext.qdrantUpsert.mockResolvedValue({ status: 'completed' });
    const res = await request(app).post('/api/resume/save').send(body);
    expect(res.status).toBe(200);
    expect(ext.qdrantDelete).toHaveBeenCalledOnce();
    expect(existing.filename).toBe('cv.pdf');
    expect(res.body.data.id).toBe('rid');
  });

  it('returns 500 VectorDbError when the vector store fails', async () => {
    vi.spyOn(Resume, 'findOne').mockReturnValue(mockQuery(null) as any);
    vi.spyOn(Resume.prototype, 'save').mockImplementation(async function (this: any) { return this; });
    ext.qdrantUpsert.mockRejectedValue(new Error('qdrant down'));
    const res = await request(app).post('/api/resume/save').send(body);
    expect(res.status).toBe(500);
    expect(res.body.error).toContain('Vector database insert failed');
    expect(res.body.details).toEqual(['VECTOR_DB_ERROR']);
  });
});

describe('GET /api/resume/retrieve', () => {
  it('400s without email', async () => {
    const res = await request(app).get('/api/resume/retrieve');
    expect(res.status).toBe(400);
    expect(res.body.details).toEqual(['MISSING_EMAIL']);
  });
  it('404s when no resume exists', async () => {
    vi.spyOn(Resume, 'findOne').mockReturnValue(mockQuery(null) as any);
    const res = await request(app).get('/api/resume/retrieve').query({ email: 'x@y.co' });
    expect(res.status).toBe(404);
    expect(res.body.details).toEqual(['RESUME_NOT_FOUND']);
  });
  it('returns the resume DTO', async () => {
    vi.spyOn(Resume, 'findOne').mockReturnValue(mockQuery(fakeDoc({ filename: 'cv.pdf', fileLink: 'https://x/cv.pdf', industry: 'Others' })) as any);
    const res = await request(app).get('/api/resume/retrieve').query({ email: 'x@y.co' });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ filename: 'cv.pdf', fileLink: 'https://x/cv.pdf', status: 'completed' });
  });
});

describe('GET /api/resume/status', () => {
  it('reports status', async () => {
    const res = await request(app).get('/api/resume/status');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('evalia-ai-server');
  });
});

describe('GET /api/resume/:resumeId', () => {
  it('returns the resume with downloadUrl', async () => {
    vi.spyOn(Resume, 'findById').mockReturnValue(mockQuery(fakeDoc({ filename: 'cv.pdf', fileLink: 'https://x/cv.pdf' })) as any);
    const res = await request(app).get('/api/resume/507f1f77bcf86cd799439011');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ filename: 'cv.pdf', fileLink: 'https://x/cv.pdf', downloadUrl: 'https://x/cv.pdf' });
  });
  it('BUG: unknown id gives 500 (DocumentNotFoundError) rather than 404', async () => {
    vi.spyOn(Resume, 'findById').mockReturnValue(mockQuery(null) as any);
    const res = await request(app).get('/api/resume/507f1f77bcf86cd799439011');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/resume/shortlist/:k (NLP search)', () => {
  it('400s without job_description', async () => {
    const res = await request(app).post('/api/resume/shortlist/3').send({});
    expect(res.status).toBe(400);
  });
  it('runs LLM extraction -> embeddings -> Qdrant global search -> score merge', async () => {
    ext.openaiChatCreate.mockResolvedValue(llmReply(JSON.stringify({ industry: 'STEM & Technical', skills: 'Go', experience: '5y', projects: '', education: 'BSc' })));
    ext.qdrantQuery.mockImplementation(async (_c: string, q: any) => ({ points: [point('c1', 0.9123), point('c2', 0.5)] }));
    const res = await request(app).post('/api/resume/shortlist/2').send({ job_description: 'We need a Go dev' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Vector search completed successfully');
    // 3 non-empty sections -> 3 embeddings -> 3 Qdrant queries
    expect(ext.openaiEmbeddingsCreate).toHaveBeenCalledTimes(3);
    expect(ext.qdrantQuery).toHaveBeenCalledTimes(3);
    expect(ext.qdrantQuery.mock.calls[0][1]).toMatchObject({ limit: 2, with_payload: true });
    expect(res.body.data).toEqual([
      { 'candidate-id': 'c1', candidateName: 'Ann', skills: 0.91, education: 0.91, experience: 0.91, projects: null },
      { 'candidate-id': 'c2', candidateName: 'Ann', skills: 0.5, education: 0.5, experience: 0.5, projects: null },
    ]);
  });
});

describe('GET /api/resume/:jobId/shortlist/:k (automated shortlist)', () => {
  it('fetches applicants from the job service and filters the vector search to them', async () => {
    ext.axiosGet.mockResolvedValue({ data: { data: { applications: [{ candidateId: 'c1' }, { candidateId: 'c3' }] } } });
    ext.qdrantQuery.mockResolvedValue({ points: [point('c1', 0.8)] });
    const res = await request(app).get('/api/resume/job-9/shortlist/5');
    expect(res.status).toBe(200);
    expect(ext.axiosGet).toHaveBeenCalledWith('http://job-service.test/api/jobs/job-9');
    expect(ext.qdrantQuery.mock.calls[0][1].filter).toEqual({ must: [{ key: 'candidate-id', match: { any: ['c1', 'c3'] } }] });
    expect(ext.qdrantQuery.mock.calls[0][1].limit).toBe(5);
    expect(res.body.data[0]).toMatchObject({ 'candidate-id': 'c1', skills: 0.8 });
  });
  it('500s when the job service is unreachable', async () => {
    ext.axiosGet.mockRejectedValue(new Error('ECONNREFUSED'));
    const res = await request(app).get('/api/resume/job-9/shortlist/5');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('ECONNREFUSED');
  });
});

describe('GET /api/resume/:candidateId/vector', () => {
  it('returns stored vectors by section', async () => {
    ext.qdrantScroll.mockResolvedValue({ points: [{ payload: { section: 'skills' }, vector: [0.1, 0.2] }] });
    const res = await request(app).get('/api/resume/cand-1/vector');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ skills: { vector: [0.1, 0.2], payload: { section: 'skills' } } });
  });
  it('returns data:null when the candidate has no vectors', async () => {
    ext.qdrantScroll.mockResolvedValue({ points: [] });
    const res = await request(app).get('/api/resume/cand-1/vector');
    expect(res.body).toEqual({ success: true, data: null });
  });
});
