import { describe, it, expect, vi } from 'vitest';
import supertest from 'supertest';

const h = vi.hoisted(() => ({ connects: 0, notify: vi.fn() }));
vi.mock('../../src/config/database', () => ({ default: () => { h.connects++; } }));
vi.mock('../../src/utils/notify', () => ({ sendNotification: h.notify }));
vi.mock('../../src/routes', async () => {
  const express = await import('express');
  const r = express.default.Router();
  r.get('/ok', (_q, res) => res.json({ ok: true }));
  r.get('/boom', () => { throw new Error('kaboom'); });
  r.post('/echo', (req, res) => res.json({ body: req.body }));
  return { default: r };
});

import app from '../../src/app';

describe('src/app', () => {
  it('connects to the database at import time', () => {
    expect(h.connects).toBe(1);
  });

  it('GET / returns a welcome payload', async () => {
    const res = await supertest(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, message: 'Welcome to Evalia upskill engine', version: '1.0.0', environment: 'test' });
    expect(new Date(res.body.timestamp).toString()).not.toBe('Invalid Date');
  });

  it('mounts routes under /api', async () => {
    expect((await supertest(app).get('/api/ok')).body).toEqual({ ok: true });
  });

  it('parses JSON and urlencoded bodies', async () => {
    expect((await supertest(app).post('/api/echo').send({ a: 1 })).body.body).toEqual({ a: 1 });
    expect((await supertest(app).post('/api/echo').type('form').send('x=1&y=2')).body.body).toEqual({ x: '1', y: '2' });
  });

  it('applies CORS for allowed origins with credentials', async () => {
    const res = await supertest(app).get('/').set('Origin', 'http://localhost:3000');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('does not grant CORS to unknown origins', async () => {
    const res = await supertest(app).get('/').set('Origin', 'http://evil.example');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('answers preflight with 200', async () => {
    const res = await supertest(app).options('/api/ok').set('Origin', 'http://localhost:3000').set('Access-Control-Request-Method', 'POST');
    expect(res.status).toBe(200);
  });

  it('serves the OpenAPI JSON and Swagger UI', async () => {
    const json = await supertest(app).get('/api/docs.json');
    expect(json.body.openapi).toMatch(/^3/);
    const ui = await supertest(app).get('/api/docs/');
    expect(ui.status).toBe(200);
    expect(ui.text).toContain('swagger');
  });

  it('GET /test-notification publishes a notification', async () => {
    const res = await supertest(app).get('/test-notification');
    expect(res.text).toBe('Test notification sent successfully');
    expect(h.notify).toHaveBeenCalledWith(expect.objectContaining({ type: 'job.posting.created', jobId: 'test-job-456' }), 'notifications');
  });

  it('GET /test-mail-notification publishes an email notification', async () => {
    const res = await supertest(app).get('/test-mail-notification');
    expect(res.status).toBe(200);
    expect(h.notify).toHaveBeenCalledWith(expect.objectContaining({ type: 'job.application.rejected', stage: 'rejected' }), 'email-notification');
  });

  it('returns a JSON 404 for unknown routes', async () => {
    const res = await supertest(app).get('/nope');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ success: false, error: 'Route not found' });
  });

  it('global error handler returns 500 with the message', async () => {
    const res = await supertest(app).get('/api/boom');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ success: false, error: 'Internal server error', message: 'kaboom' });
  });

  it('malformed JSON yields a 500 from the global handler (no 400 mapping)', async () => {
    const res = await supertest(app).post('/api/echo').set('Content-Type', 'application/json').send('{bad');
    expect(res.status).toBe(500);
  });
});
