import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers/testApp';

const app = createTestApp();

describe('HTTP API basics', () => {
  it('GET /health -> ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.text).toBe('ok');
  });

  it('sends permissive CORS headers', async () => {
    const res = await request(app).get('/health').set('Origin', 'https://client.test');
    expect(res.headers['access-control-allow-origin']).toBe('*');
  });

  it('answers CORS preflight requests', async () => {
    const res = await request(app)
      .options('/api/interview')
      .set('Origin', 'https://client.test')
      .set('Access-Control-Request-Method', 'POST');
    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-methods']).toContain('POST');
  });

  it('returns 404 for unknown routes', async () => {
    expect((await request(app).get('/nope')).status).toBe(404);
  });

  it('turns malformed JSON bodies into the generic 500 payload', async () => {
    const res = await request(app).post('/api/interview').set('Content-Type', 'application/json').send('{bad');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ success: false, message: 'Something went wrong!' });
  });
});
