import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import supertest from 'supertest';

const h = vi.hoisted(() => ({ get: vi.fn(), create: vi.fn() }));
vi.mock('../../../src/controllers/CompatibilityReviewController', () => ({
  CompatibilityReviewController: class {
    getCompatibilityById = (req: any, res: any) => res.json({ h: 'get', id: req.params.reviewId });
    createCompatibilityReview = (req: any, res: any) => res.json({ h: 'create' });
  },
}));

import compatRoutes from '../../../src/routes/compatibilityReviewRoutes';
import rootRoutes from '../../../src/routes';
vi.mock('../../../src/routes/jobRoutes', async () => {
  const express = await import('express');
  const r = express.default.Router();
  r.get('/ping', (_req, res) => res.json({ h: 'jobs' }));
  return { default: r };
});

describe('compatibilityReviewRoutes', () => {
  const app = express().use(express.json()).use('/compat', compatRoutes);
  it('GET /:reviewId', async () => {
    expect((await supertest(app).get('/compat/abc')).body).toEqual({ h: 'get', id: 'abc' });
  });
  it('POST /create is not swallowed by GET /:reviewId', async () => {
    expect((await supertest(app).post('/compat/create')).body).toEqual({ h: 'create' });
  });
  it('GET /create is treated as a reviewId', async () => {
    expect((await supertest(app).get('/compat/create')).body.id).toBe('create');
  });
});

describe('routes index', () => {
  const app = express().use(express.json()).use('/api', rootRoutes);
  it('mounts /jobs and /compatibility', async () => {
    expect((await supertest(app).get('/api/jobs/ping')).body).toEqual({ h: 'jobs' });
    expect((await supertest(app).get('/api/compatibility/xyz')).body).toEqual({ h: 'get', id: 'xyz' });
  });
  it('404 for unknown mounts', async () => {
    expect((await supertest(app).get('/api/other')).status).toBe(404);
  });
});
