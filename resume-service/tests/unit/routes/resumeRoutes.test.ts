import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

const { names } = vi.hoisted(() => ({
  names: ['uploadResumeToCloud', 'extractDetailsFromResume', 'saveResume', 'getResumeByEmail', 'getUploadStatus',
    'searchCandidatesUsingNLP', 'getResumeById', 'generateAutomatedShortlist', 'getResumePointById'],
}));
vi.mock('../../../src/controllers/resumeController', () => ({
  default: Object.fromEntries(names.map((n) => [n, (req: any, res: any) => res.json({ handler: n, params: req.params, file: req.file?.originalname })])),
}));

import resumeRoutes from '../../../src/routes/resumeRoutes';

const app = express().use(express.json()).use('/r', resumeRoutes)
  .use((err: any, _req: any, res: any, _next: any) => res.status(500).json({ error: err.message }));
const pdf = Buffer.from('%PDF-1.4');

describe('resumeRoutes wiring', () => {
  it.each([
    ['post', '/r/extract', 'extractDetailsFromResume'],
    ['post', '/r/save', 'saveResume'],
    ['get', '/r/retrieve', 'getResumeByEmail'],
    ['get', '/r/status', 'getUploadStatus'],
    ['post', '/r/shortlist/5', 'searchCandidatesUsingNLP'],
    ['get', '/r/abc123', 'getResumeById'],
    ['get', '/r/job1/shortlist/4', 'generateAutomatedShortlist'],
    ['get', '/r/cand1/vector', 'getResumePointById'],
  ] as const)('%s %s -> %s', async (method, url, handler) => {
    const res = await (request(app) as any)[method](url);
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe(handler);
  });

  it('passes route params', async () => {
    expect((await request(app).get('/r/job1/shortlist/4')).body.params).toEqual({ jobId: 'job1', k: '4' });
    expect((await request(app).post('/r/shortlist/9')).body.params).toEqual({ k: '9' });
  });

  it('static routes win over /:resumeId', async () => {
    expect((await request(app).get('/r/status')).body.handler).toBe('getUploadStatus');
    expect((await request(app).get('/r/retrieve')).body.handler).toBe('getResumeByEmail');
  });

  describe('POST /upload', () => {
    it('accepts a PDF and exposes it as req.file', async () => {
      const res = await request(app).post('/r/upload').attach('file', pdf, { filename: 'cv.pdf', contentType: 'application/pdf' });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ handler: 'uploadResumeToCloud', file: 'cv.pdf' });
    });
    it('rejects non-PDF files', async () => {
      const res = await request(app).post('/r/upload').attach('file', Buffer.from('x'), { filename: 'a.png', contentType: 'image/png' });
      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Only PDF files are allowed');
    });
    it('rejects files over 10MB', async () => {
      const big = Buffer.alloc(10 * 1024 * 1024 + 1, 1);
      const res = await request(app).post('/r/upload').attach('file', big, { filename: 'big.pdf', contentType: 'application/pdf' });
      expect(res.status).toBe(500);
      expect(res.body.error).toBe('File too large');
    });
    it('passes through with no file (controller decides)', async () => {
      const res = await request(app).post('/r/upload').field('userId', '1');
      expect(res.body.handler).toBe('uploadResumeToCloud');
      expect(res.body.file).toBeUndefined();
    });
  });
});
