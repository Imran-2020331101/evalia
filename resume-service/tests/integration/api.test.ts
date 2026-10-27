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

describe('GET /health and /api/health', () => {
  it('root health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body.success).toBe(true);
  });
  it('api health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body).toMatchObject({ success: true, version: '1.0.0' });
  });
});

describe('GET /', () => {
  it('describes the service', async () => {
    const res = await request(app).get('/');
    expect(res.body.endpoints.upload).toBe('/api/resume/upload');
  });
});

describe('unknown routes', () => {
  it.each([['get', '/api/unknown'], ['post', '/api/resume/nope/deep/path/x'], ['put', '/health'], ['delete', '/']])('%s %s -> JSON 404', async (m, url) => {
    const res = await (request(app) as any)[m](url);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Route not found');
    expect(res.body.message).toContain(url);
  });
});

describe('request parsing', () => {
  it('parses JSON bodies', async () => {
    const res = await request(app).post('/api/resume/shortlist/1').send({ job_description: '' });
    expect(res.status).toBe(400);
    expect(res.body.details).toEqual(['MISSING_JOB_DESCRIPTION']);
  });
  it('parses urlencoded bodies', async () => {
    const res = await request(app).post('/api/resume/shortlist/1').type('form').send('job_description=');
    expect(res.status).toBe(400);
    expect(res.body.details).toEqual(['MISSING_JOB_DESCRIPTION']);
  });
  it('rejects oversized JSON bodies (> 10MB)', async () => {
    const res = await request(app).post('/api/resume/save').set('Content-Type', 'application/json')
      .send(JSON.stringify({ blob: 'x'.repeat(10 * 1024 * 1024 + 100) }));
    // BUG: body-parser's PayloadTooLargeError (413) loses its status in errorHandler's `{ ...err }` copy and becomes a 500.
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('request entity too large');
    expect(res.body.success).toBe(false);
  });
});

describe('CORS', () => {
  it('allows the default dev origins with credentials', async () => {
    for (const origin of ['http://localhost:3000', 'http://localhost:3001']) {
      const res = await request(app).get('/api/health').set('Origin', origin);
      expect(res.headers['access-control-allow-origin']).toBe(origin);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    }
  });
  it('does not allow other origins', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'https://evil.test');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});
