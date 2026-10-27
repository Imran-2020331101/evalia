import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import supertest from 'supertest';

const h = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('../../src/config/database', () => ({ default: () => {} }));
vi.mock('../../src/config/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }, default: { info: vi.fn(), error: vi.fn() } }));
vi.mock('../../src/utils/notify', () => ({ sendNotification: vi.fn() }));
vi.mock('axios', () => ({ default: { get: h.get, post: vi.fn() } }));
vi.mock('../../src/models/JobDetails', async () => {
  const { createModelMock } = await import('../helpers/testDb');
  return { JobDetailsModel: createModelMock() };
});
vi.mock('../../src/models/CompatibilityReview', async () => {
  const { createModelMock } = await import('../helpers/testDb');
  return { CompatibilityReviewModel: createModelMock() };
});

import { api } from '../helpers/testApp';
import errorHandler from '../../src/middleware/errorHandler';
import { asyncHandler, ApiError } from '../../src/utils';
import { JobDetailsModel } from '../../src/models/JobDetails';
import { chain, OID } from '../helpers/testDb';

const M: any = JobDetailsModel;

describe('error handling through the real app', () => {
  it('validation failures that are handled explicitly return 400 with details', async () => {
    const res = await api().post('/api/jobs').send({});
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, error: 'Validation failed' });
  });

  it('malformed JSON bodies -> global handler (500)', async () => {
    const res = await api().post('/api/jobs').set('Content-Type', 'application/json').send('{oops');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Internal server error');
  });

  it('KNOWN BUG: ZodError thrown from controllers surfaces as 500 instead of 400', async () => {
    const res = await api().get('/api/jobs/not-an-object-id');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal server error');
    expect(res.body.message).toContain('Invalid job ID');
  });

  it('KNOWN BUG: ApiError(400) from services is flattened to 500 (src/middleware/errorHandler is not mounted)', async () => {
    M.findById.mockReturnValue(chain({ applications: [{ candidateEmail: 'a@x.com' }] }));
    const res = await api().post('/api/jobs/apply').send({ jobId: OID(1), email: 'a@x.com', candidateId: OID(2) });
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('User Already Applied to this job');
  });

  it('KNOWN BUG: missing documents (orFail) surface as 500 rather than 404', async () => {
    M.findByIdAndDelete.mockReturnValue(chain(null));
    const res = await api().delete(`/api/jobs/${OID(3)}`);
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('No document found for query');
  });

  it('KNOWN BUG: invalid job id on status update is not validated', async () => {
    M.findByIdAndUpdate.mockReturnValue(chain(null, Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' })));
    const res = await api().put('/api/jobs/xyz/status').send({ status: 'FILLED' });
    expect(res.status).toBe(500);
  });

  it('upstream failures (resume service) bubble up as 500 with the message', async () => {
    h.get.mockRejectedValue(new Error('ECONNREFUSED'));
    const res = await api().get('/api/jobs/candidates/c1/suggestions');
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('ECONNREFUSED');
  });
});

describe('errorHandler middleware mounted on an app (intended behaviour)', () => {
  const app = express();
  app.get('/api-error', asyncHandler(async () => { throw new ApiError(403, 'forbidden'); }));
  app.get('/cast', asyncHandler(async () => { throw Object.assign(new Error('c'), { name: 'CastError' }); }));
  app.get('/dup', asyncHandler(async () => { throw Object.assign(new Error('d'), { code: 11000 }); }));
  app.get('/validation', asyncHandler(async () => {
    throw Object.assign(new Error('v'), { name: 'ValidationError', errors: { title: { message: 'Title is required' } } });
  }));
  app.get('/plain', asyncHandler(async () => { throw new Error('plain'); }));
  app.use(errorHandler);

  it.each([
    ['/api-error', 403, 'forbidden'],
    ['/cast', 404, 'Resource not found'],
    ['/dup', 400, 'Duplicate field value entered'],
    ['/validation', 400, 'Title is required'],
    ['/plain', 500, 'plain'],
  ])('%s -> %i', async (path, status, error) => {
    const res = await supertest(app).get(path);
    expect(res.status).toBe(status);
    expect(res.body).toEqual({ success: false, error });
  });
});
