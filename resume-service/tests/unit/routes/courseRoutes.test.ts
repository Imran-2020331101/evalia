import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

const { names } = vi.hoisted(() => ({
  names: ['personalizedCourseSuggestion', 'saveCourse', 'fetchSavedCourses', 'removeCourseFromSavedList'],
}));
vi.mock('../../../src/controllers/courseController', () => ({
  courseController: Object.fromEntries(names.map((n) => [n, (req: any, res: any) => res.json({ handler: n, params: req.params })])),
}));

import courseRoutes from '../../../src/routes/courseRoutes';

const app = express().use('/api/course', courseRoutes);

describe('courseRoutes wiring', () => {
  it('GET /suggestions', async () => {
    expect((await request(app).get('/api/course/suggestions')).body.handler).toBe('personalizedCourseSuggestion');
  });
  it('POST /candidate/:candidateId/save', async () => {
    const res = await request(app).post('/api/course/candidate/c1/save');
    expect(res.body).toEqual({ handler: 'saveCourse', params: { candidateId: 'c1' } });
  });
  it('GET /candidate/:candidateId/saved/all', async () => {
    const res = await request(app).get('/api/course/candidate/c1/saved/all');
    expect(res.body).toEqual({ handler: 'fetchSavedCourses', params: { candidateId: 'c1' } });
  });
  it('DELETE /candidate/:candidateId/delete/:videoId', async () => {
    const res = await request(app).delete('/api/course/candidate/c1/delete/v9');
    expect(res.body).toEqual({ handler: 'removeCourseFromSavedList', params: { candidateId: 'c1', videoId: 'v9' } });
  });
  it('does not expose other methods/paths', async () => {
    expect((await request(app).post('/api/course/suggestions')).status).toBe(404);
    expect((await request(app).get('/api/course/candidate/c1/save')).status).toBe(404);
  });
});
