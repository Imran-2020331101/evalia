import { describe, it, expect, vi } from 'vitest';

const h = vi.hoisted(() => ({ connects: 0, notify: vi.fn() }));
vi.mock('../../src/config/database', () => ({ default: () => { h.connects++; } }));
vi.mock('../../src/utils/notify', () => ({ sendNotification: h.notify }));
vi.mock('../../src/models/JobDetails', async () => {
  const { createModelMock } = await import('../helpers/testDb');
  return { JobDetailsModel: createModelMock() };
});
vi.mock('../../src/models/CompatibilityReview', async () => {
  const { createModelMock } = await import('../helpers/testDb');
  return { CompatibilityReviewModel: createModelMock() };
});

import { api } from '../helpers/testApp';

describe('API surface (full app, mocked I/O)', () => {
  it('boots without listening and connects to the DB once', () => {
    expect(h.connects).toBe(1);
  });

  it('GET / health/root', async () => {
    const res = await api().get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toMatchObject({ success: true, version: '1.0.0', environment: 'test' });
  });

  it('serves OpenAPI JSON that documents the job endpoints', async () => {
    const res = await api().get('/api/docs.json');
    expect(res.status).toBe(200);
    expect(Object.keys(res.body.paths)).toContain('/api/jobs');
  });

  it('serves Swagger UI', async () => {
    const res = await api().get('/api/docs/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
  });

  it('JSON 404 for unknown routes of any method', async () => {
    for (const m of ['get', 'post', 'put', 'delete'] as const) {
      const res = await (api() as any)[m]('/definitely/not/here');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ success: false, error: 'Route not found' });
    }
  });

  it('unknown /api sub-route is 404', async () => {
    expect((await api().get('/api/unknown')).status).toBe(404);
  });

  it('CORS: allowed origin echoed, others not', async () => {
    const ok = await api().get('/').set('Origin', 'http://localhost:3001');
    expect(ok.headers['access-control-allow-origin']).toBe('http://localhost:3001');
    const bad = await api().get('/').set('Origin', 'http://other.test');
    expect(bad.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('dev-only notification endpoints publish to the broker (mocked)', async () => {
    expect((await api().get('/test-notification')).status).toBe(200);
    expect((await api().get('/test-mail-notification')).status).toBe(200);
    expect(h.notify).toHaveBeenCalledTimes(2);
    expect(h.notify.mock.calls.map((c) => c[1])).toEqual(['notifications', 'email-notification']);
  });
});
