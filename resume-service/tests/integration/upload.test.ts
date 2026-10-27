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
const fields = (r: request.Test) => r.field('userEmail', 'john@example.com').field('userId', 'u1');

describe('resume upload endpoint (multer + validation + Cloudinary)', () => {
  beforeEach(() => { vi.spyOn(ExtractedResume.prototype, 'save').mockResolvedValue(undefined as any); });

  it('accepts a small in-memory PDF', async () => {
    const res = await fields(request(app).post('/api/resume/upload')).attach('file', pdf, { filename: 'cv.pdf', contentType: 'application/pdf' });
    expect(res.status).toBe(200);
    expect(res.body.data.downloadUrl).toMatch(/^http/);
  });

  it('400s with MISSING_FILE when no file is attached', async () => {
    const res = await fields(request(app).post('/api/resume/upload'));
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, error: 'Missing required field: file', details: ['MISSING_FILE'] });
    expect(ext.cloudinaryUploadStream).not.toHaveBeenCalled();
  });

  it('rejects non-PDF mime types before reaching the controller', async () => {
    const res = await fields(request(app).post('/api/resume/upload')).attach('file', Buffer.from('png'), { filename: 'a.png', contentType: 'image/png' });
    expect(res.status).toBe(500); // plain Error from multer fileFilter -> generic handler
    expect(res.body.error).toBe('Only PDF files are allowed');
    expect(ext.cloudinaryUploadStream).not.toHaveBeenCalled();
  });

  it('rejects files larger than 10MB with a 400', async () => {
    const big = Buffer.alloc(10 * 1024 * 1024 + 10, 1);
    const res = await fields(request(app).post('/api/resume/upload')).attach('file', big, { filename: 'big.pdf', contentType: 'application/pdf' });
    expect(res.status).toBe(400);
    // BUG: errorHandler switches on err.message === 'LIMIT_FILE_SIZE' but multer's message is 'File too large',
    // so users always get the generic text instead of 'File too large'.
    expect(res.body.error).toBe('File upload error');
    expect(ext.cloudinaryUploadStream).not.toHaveBeenCalled();
  });

  it('rejects an upload under the wrong field name', async () => {
    const res = await fields(request(app).post('/api/resume/upload')).attach('resume', pdf, { filename: 'cv.pdf', contentType: 'application/pdf' });
    expect(res.status).toBe(400);
    expect(ext.cloudinaryUploadStream).not.toHaveBeenCalled();
  });

  it('forwards zod validation failure for missing/invalid fields (currently a 500)', async () => {
    const res = await request(app).post('/api/resume/upload').field('userEmail', 'not-an-email').field('userId', 'u1')
      .attach('file', pdf, { filename: 'cv.pdf', contentType: 'application/pdf' });
    // BUG: ZodError is not mapped to 400 by errorHandler.
    expect(res.status).toBe(500);
    expect(res.body.error).toContain('Valid email address is required');
  });

  it('maps Cloudinary failures to CloudinaryUploadError (500)', async () => {
    ext.cloudinaryUploadStream.mockImplementation((_o: any, done: any) => {
      setImmediate(() => done(new Error('cloudinary 503'), undefined));
      return new (require('stream').PassThrough)();
    });
    const res = await fields(request(app).post('/api/resume/upload')).attach('file', pdf, { filename: 'cv.pdf', contentType: 'application/pdf' });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Cloudinary upload failed: cloudinary 503');
    expect(res.body.details).toEqual(['CLOUDINARY_UPLOAD_ERROR']);
  });

  it('sanitizes the userId used for the Cloudinary public id', async () => {
    await request(app).post('/api/resume/upload').field('userEmail', 'a@b.co').field('userId', '../evil/id')
      .attach('file', pdf, { filename: 'cv.pdf', contentType: 'application/pdf' });
    expect(ext.cloudinaryUploadStream.mock.calls[0][0].public_id).toBe('___evil_id.pdf');
  });
});
