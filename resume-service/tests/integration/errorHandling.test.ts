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

describe('global error handler over HTTP', () => {
  it('serialises CustomApiError with status, message, details and requestId', async () => {
    const res = await request(app).get('/api/resume/retrieve');
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, error: 'Missing required field: email', details: ['MISSING_EMAIL'] });
    expect(res.body.requestId).toEqual(expect.any(String));
  });

  it('echoes x-request-id', async () => {
    const res = await request(app).get('/api/resume/retrieve').set('x-request-id', 'trace-123');
    expect(res.body.requestId).toBe('trace-123');
  });

  it('maps mongoose CastError to 404', async () => {
    const err: any = new Error('Cast to ObjectId failed'); err.name = 'CastError'; err.value = 'bad-id';
    vi.spyOn(Resume, 'findById').mockReturnValue(mockQuery(null, err) as any);
    const res = await request(app).get('/api/resume/bad-id');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Resource not found with id: bad-id');
  });

  it('maps duplicate key errors (11000) to 400', async () => {
    const err: any = new Error('E11000'); err.code = 11000; err.keyValue = { candidateId: 'c1' };
    vi.spyOn(SavedCourse, 'findOne').mockReturnValue(mockQuery(null) as any);
    vi.spyOn(SavedCourse, 'create').mockRejectedValue(err);
    const res = await request(app).post('/api/course/candidate/c1/save').send({ videoId: 'v', title: 't' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Duplicate field value entered for candidateId');
  });

  it('maps real mongoose ValidationError (invalid industry) to 400 with details', async () => {
    vi.spyOn(Resume, 'findOne').mockReturnValue(mockQuery(null) as any);
    const res = await request(app).post('/api/resume/save').send({
      resumeData: { filename: 'f', fileLink: 'l', industry: 'Underwater Basket Weaving' }, userId: 'u', userName: 'n', userEmail: 'a@b.co',
    });
    expect(res.status).toBe(400);
    expect(res.body.details[0]).toMatch(/not a valid enum value/);
  });

  it('real mongoose ValidationError for missing required fields', async () => {
    vi.spyOn(Resume, 'findOne').mockReturnValue(mockQuery(null) as any);
    const res = await request(app).post('/api/resume/save').send({ resumeData: { industry: 'Others' }, userId: 'u', userName: 'n', userEmail: 'a@b.co' });
    expect(res.status).toBe(400);
    expect(res.body.details.join(' ')).toMatch(/filename/);
  });

  it('BUG: zod input validation errors are reported as 500', async () => {
    const res = await request(app).post('/api/resume/extract').send({ resumeURL: 'not-a-url', userEmail: 'e', userId: 'u' });
    expect(res.status).toBe(500);
    expect(res.body.error).toContain('Valid resume URL is required');
  });

  it('BUG: missing resumeData in /save is a 500 TypeError instead of 400', async () => {
    const res = await request(app).post('/api/resume/save').send({ userId: 'u', userName: 'n', userEmail: 'e' });
    expect(res.status).toBe(500);
  });

  it('malformed JSON yields a 400 JSON error body', async () => {
    const res = await request(app).post('/api/resume/save').set('Content-Type', 'application/json').send('{"a":');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('unhandled non-API errors surface as 500 with the message', async () => {
    vi.spyOn(Resume, 'findOne').mockReturnValue(mockQuery(null, new Error('db exploded')) as any);
    const res = await request(app).get('/api/resume/retrieve').query({ email: 'a@b.co' });
    expect(res.status).toBe(500);
    expect(res.body).toMatchObject({ success: false, error: 'db exploded' });
  });

  it('LLM provider errors during extraction become 500s', async () => {
    vi.spyOn(ExtractedResume, 'findOne').mockReturnValue(mockQuery({ text: 't' }) as any);
    ext.openaiChatCreate.mockRejectedValue(new Error('429 Too Many Requests'));
    const res = await request(app).post('/api/resume/extract').send({ resumeURL: 'https://x.com/a.pdf', userEmail: 'e', userId: 'u' });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('429 Too Many Requests');
  });

  it('Qdrant failures during automated shortlist become 500s', async () => {
    ext.axiosGet.mockResolvedValue({ data: { data: { applications: [] } } });
    ext.qdrantQuery.mockRejectedValue(new Error('qdrant 500'));
    const res = await request(app).get('/api/resume/job/shortlist/3');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('qdrant 500');
  });
});
