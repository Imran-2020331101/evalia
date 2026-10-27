import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { Router } from 'express';
import 'express-async-errors';
import { createTestApp } from '../helpers/testApp';
import { BadRequestError, NotFoundError, UnauthenticatedError, CustomApiError } from '../../src/errors';
import { Interview } from '../../src/models/InterviewSchema';

const r = Router();
const named = (name: string, extra = {}) => Object.assign(new Error('x'), { name }, extra);
r.get('/bad-request', () => { throw new BadRequestError('nope'); });
r.get('/not-found', () => { throw new NotFoundError('missing'); });
r.get('/unauth', () => { throw new UnauthenticatedError('login'); });
r.get('/custom', () => { throw new CustomApiError('teapot', 418); });
r.get('/doc-not-found', async () => { throw named('DocumentNotFoundError'); });
r.get('/cast', async () => { throw named('CastError'); });
r.get('/job-404', async () => { throw Object.assign(new Error('x'), { response: { status: 404 } }); });
r.get('/job-missing', async () => { throw new Error('Job not found'); });
r.get('/boom', async () => { throw new Error('secret'); });
r.get('/mongoose-validation', async () => { await new Interview({}).validate(); });

const app = createTestApp(r);

describe('error handling over HTTP', () => {
  it.each([
    ['/bad-request', 400, { msg: 'nope' }],
    ['/not-found', 404, { msg: 'missing' }],
    ['/unauth', 401, { msg: 'login' }],
    ['/custom', 418, { msg: 'teapot' }],
    ['/doc-not-found', 404, { success: false, message: 'Resource not found' }],
    ['/cast', 400, { success: false, message: 'Invalid ID format' }],
    ['/job-404', 404, { success: false, message: 'Job service not found or job does not exist' }],
    ['/job-missing', 404, { success: false, message: 'Job does not exist' }],
    ['/boom', 500, { success: false, message: 'Something went wrong!' }],
  ])('GET /test%s -> %i', async (path, status, body) => {
    const res = await request(app).get(`/test${path}`);
    expect(res.status).toBe(status);
    expect(res.body).toEqual(body);
  });

  it('serialises a real mongoose ValidationError as 400 with messages', async () => {
    const res = await request(app).get('/test/mongoose-validation');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation error');
    expect(res.body.errors.length).toBeGreaterThanOrEqual(6);
    expect(res.body.errors.some((m: string) => /candidateEmail/.test(m))).toBe(true);
  });

  it('never leaks the underlying error text on 500s', async () => {
    const res = await request(app).get('/test/boom');
    expect(JSON.stringify(res.body)).not.toContain('secret');
  });
});
