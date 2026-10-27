import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

vi.mock('../../../src/routes/resumeRoutes', async () => {
  const e = (await import('express')).default;
  const r = e.Router(); r.get('/ping', (_q, s) => s.json({ mounted: 'resume' })); return { default: r };
});
vi.mock('../../../src/routes/courseRoutes', async () => {
  const e = (await import('express')).default;
  const r = e.Router(); r.get('/ping', (_q, s) => s.json({ mounted: 'course' })); return { default: r };
});

import routes from '../../../src/routes';

const app = express().use('/api', routes);

describe('routes index', () => {
  it('GET /health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, message: 'Evalia AI Server is running', version: '1.0.0' });
    expect(new Date(res.body.timestamp).toString()).not.toBe('Invalid Date');
  });
  it('mounts /resume and /course', async () => {
    expect((await request(app).get('/api/resume/ping')).body.mounted).toBe('resume');
    expect((await request(app).get('/api/course/ping')).body.mounted).toBe('course');
  });
});
