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

describe('GET /api/course/suggestions', () => {
  it('400s without candidateEmail', async () => {
    const res = await request(app).get('/api/course/suggestions');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Candidate email is required');
  });

  it('builds a YouTube query from resume keywords and maps the results', async () => {
    vi.spyOn(Resume, 'findOne').mockReturnValue(mockQuery({ analysis: { keywords: ['react', 'node'] } }) as any);
    ext.axiosGet.mockResolvedValue({ data: { nextPageToken: 'N', pageInfo: { totalResults: 1 },
      items: [{ id: { videoId: 'v1' }, snippet: { title: 'T', description: 'D', channelId: 'c', channelTitle: 'CT', thumbnails: {}, publishedAt: '2024' } }] } });
    const res = await request(app).get('/api/course/suggestions').query({ candidateEmail: 'a@b.co' });
    expect(res.status).toBe(200);
    expect(ext.axiosGet.mock.calls[0][0]).toContain('q=react node tutorial+course');
    expect(ext.axiosGet.mock.calls[0][0]).toContain('maxResults=10');
    expect(res.body.data).toMatchObject({ nextPageToken: 'N', totalResults: 1, courses: [{ videoId: 'v1', title: 'T' }] });
  });

  it('500s with the descriptive message when the resume does not exist', async () => {
    vi.spyOn(Resume, 'findOne').mockReturnValue(mockQuery(null) as any);
    const res = await request(app).get('/api/course/suggestions').query({ candidateEmail: 'a@b.co' });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Resume not found for email: a@b.co');
  });

  it('500s when YouTube fails', async () => {
    vi.spyOn(Resume, 'findOne').mockReturnValue(mockQuery({}) as any);
    ext.axiosGet.mockRejectedValue(new Error('quotaExceeded'));
    const res = await request(app).get('/api/course/suggestions').query({ candidateEmail: 'a@b.co' });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('quotaExceeded');
  });
});

describe('saved courses lifecycle', () => {
  const course = { videoId: 'v1', title: 'Intro', description: 'd', channelId: 'c', channelTitle: 'CT', thumbnails: { default: { url: 'u' } }, publishedAt: '2024-01-01T00:00:00Z' };

  it('POST /candidate/:id/save creates a list', async () => {
    vi.spyOn(SavedCourse, 'findOne').mockReturnValue(mockQuery(null) as any);
    const create = vi.spyOn(SavedCourse, 'create').mockResolvedValue({ candidateId: 'c1', savedCourses: [course] } as any);
    const res = await request(app).post('/api/course/candidate/c1/save').send(course);
    expect(res.status).toBe(200);
    expect(create).toHaveBeenCalledWith({ candidateId: 'c1', savedCourses: [course] });
    expect(res.body.data.savedCourses).toHaveLength(1);
  });

  it('POST save 400s without videoId', async () => {
    const res = await request(app).post('/api/course/candidate/c1/save').send({ title: 'x' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Candidate ID and Video ID are required');
  });

  it('POST save is idempotent for an already-saved video', async () => {
    const doc = fakeDoc({ candidateId: 'c1', savedCourses: [{ videoId: 'v1' }] });
    vi.spyOn(SavedCourse, 'findOne').mockReturnValue(mockQuery(doc) as any);
    const res = await request(app).post('/api/course/candidate/c1/save').send(course);
    expect(res.status).toBe(200);
    expect(doc.save).not.toHaveBeenCalled();
  });

  it('GET /candidate/:id/saved/all lists saved documents', async () => {
    vi.spyOn(SavedCourse, 'find').mockReturnValue(mockQuery([fakeDoc({ candidateId: 'c1', savedCourses: [course] })]) as any);
    const res = await request(app).get('/api/course/candidate/c1/saved/all');
    expect(res.status).toBe(200);
    expect(res.body.data[0].savedCourses[0].videoId).toBe('v1');
  });

  it('DELETE removes a video', async () => {
    const doc = fakeDoc({ candidateId: 'c1', savedCourses: [{ videoId: 'v1' }, { videoId: 'v2' }] });
    vi.spyOn(SavedCourse, 'findOne').mockReturnValue(mockQuery(doc) as any);
    const res = await request(app).delete('/api/course/candidate/c1/delete/v1');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Course removed successfully');
    expect(doc.savedCourses).toEqual([{ videoId: 'v2' }]);
  });

  it('DELETE 500s when the candidate has no saved list', async () => {
    vi.spyOn(SavedCourse, 'findOne').mockReturnValue(mockQuery(null) as any);
    const res = await request(app).delete('/api/course/candidate/c1/delete/v1');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Saved courses not found for candidate: c1');
  });
});
