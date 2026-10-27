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

/** Minimal in-memory Qdrant: stores upserted points and honours candidate-id filters + cosine-ish scoring. */
function installFakeQdrant() {
  const points: any[] = [];
  ext.qdrantUpsert.mockImplementation(async (_c: string, { points: p }: any) => { points.push(...p); return { status: 'completed', operation_id: points.length }; });
  const matches = (pt: any, filter: any) => (filter?.must ?? []).every((m: any) => {
    const v = pt.payload[m.key];
    return m.match.any ? m.match.any.includes(v) : v === m.match.value;
  });
  const cos = (a: number[], b: number[]) => {
    const dot = a.reduce((s, x, i) => s + x * (b[i] ?? 0), 0);
    return dot / (Math.hypot(...a) * Math.hypot(...b) || 1);
  };
  ext.qdrantQuery.mockImplementation(async (_c: string, q: any) => ({
    points: points.filter((p) => matches(p, q.filter)).map((p) => ({ id: p.id, version: 1, score: cos(q.query, p.vector), payload: p.payload }))
      .sort((a, b) => b.score - a.score).slice(0, q.limit),
  }));
  ext.qdrantDelete.mockImplementation(async (_c: string, { filter }: any) => {
    for (let i = points.length - 1; i >= 0; i--) if (matches(points[i], filter)) points.splice(i, 1);
    return { status: 'completed', operation_id: 99 };
  });
  ext.qdrantScroll.mockImplementation(async (_c: string, { filter, limit }: any) => ({
    points: points.filter((p) => matches(p, filter)).slice(0, limit),
  }));
  return points;
}

const resumeBody = (userId: string, email: string, name: string, skills: string[]) => ({
  resumeData: { filename: `${userId}.pdf`, fileLink: `https://x/${userId}.pdf`, industry: 'STEM & Technical', skills: { technical: skills },
    experience: [{ job_title: 'Dev', company: 'ACME', description: ['x'] }], education: [{ degree: 'BSc', institution: 'MIT' }] },
  userId, userName: name, userEmail: email,
});

describe('resume -> embeddings -> Qdrant pipeline (in-memory vector store)', () => {
  let points: any[];
  beforeEach(() => {
    points = installFakeQdrant();
    vi.spyOn(Resume, 'findOne').mockReturnValue(mockQuery(null) as any);
    vi.spyOn(Resume.prototype, 'save').mockImplementation(async function (this: any) { return this; });
  });

  it('saving a resume stores one point per section with candidate metadata', async () => {
    const res = await request(app).post('/api/resume/save').send(resumeBody('c1', 'ann@x.com', 'Ann', ['go']));
    expect(res.status).toBe(200);
    expect(points).toHaveLength(3);
    expect(new Set(points.map((p) => p.payload.section))).toEqual(new Set(['skills', 'experience', 'education']));
    expect(points.every((p) => p.payload['candidate-id'] === 'c1' && p.payload.is_active === true)).toBe(true);
  });

  it('GET /:candidateId/vector returns the stored sections', async () => {
    await request(app).post('/api/resume/save').send(resumeBody('c1', 'ann@x.com', 'Ann', ['go']));
    const res = await request(app).get('/api/resume/c1/vector');
    expect(res.status).toBe(200);
    expect(Object.keys(res.body.data).sort()).toEqual(['education', 'experience', 'skills']);
    expect(res.body.data.skills.vector).toHaveLength(2);
    const none = await request(app).get('/api/resume/ghost/vector');
    expect(none.body.data).toBeNull();
  });

  it('automated shortlist only ranks applicants of the job', async () => {
    await request(app).post('/api/resume/save').send(resumeBody('c1', 'ann@x.com', 'Ann', ['go']));
    await request(app).post('/api/resume/save').send(resumeBody('c2', 'bob@x.com', 'Bob', ['rust']));
    await request(app).post('/api/resume/save').send(resumeBody('c3', 'cy@x.com', 'Cy', ['java']));
    ext.axiosGet.mockResolvedValue({ data: { data: { applications: [{ candidateId: 'c1' }, { candidateId: 'c3' }] } } });
    const res = await request(app).get('/api/resume/job-1/shortlist/10');
    expect(res.status).toBe(200);
    const ids = res.body.data.map((c: any) => c['candidate-id']).sort();
    expect(ids).toEqual(['c1', 'c3']);
    expect(res.body.data[0]).toHaveProperty('skills');
  });

  it('NLP search returns candidates across the whole index with per-section scores', async () => {
    await request(app).post('/api/resume/save').send(resumeBody('c1', 'ann@x.com', 'Ann', ['go']));
    await request(app).post('/api/resume/save').send(resumeBody('c2', 'bob@x.com', 'Bob', ['rust']));
    ext.openaiChatCreate.mockResolvedValue(llmReply(JSON.stringify({ industry: 'STEM & Technical', skills: 'go', experience: 'Dev at ACME', projects: '', education: 'BSc from MIT' })));
    const res = await request(app).post('/api/resume/shortlist/5').send({ job_description: 'Go developer' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    for (const c of res.body.data) {
      expect(c.projects).toBeNull();
      expect(typeof c.skills).toBe('number');
      expect(c.candidateName).toMatch(/Ann|Bob/);
    }
  });

  it('re-saving a resume for the same user replaces the old vectors', async () => {
    await request(app).post('/api/resume/save').send(resumeBody('c1', 'ann@x.com', 'Ann', ['go']));
    expect(points).toHaveLength(3);
    const existing = fakeDoc({ filename: 'c1.pdf', uploadedBy: 'ann@x.com', status: 'completed', _id: 'rid' });
    vi.spyOn(Resume, 'findOne').mockReturnValue(mockQuery(existing) as any);
    const res = await request(app).post('/api/resume/save').send(resumeBody('c1', 'ann@x.com', 'Ann', ['go', 'rust']));
    expect(res.status).toBe(200);
    expect(ext.qdrantDelete).toHaveBeenCalledOnce();
    expect(points).toHaveLength(3); // old 3 deleted, new 3 inserted
  });

  it('propagates upsert failures as VECTOR_DB_ERROR', async () => {
    ext.qdrantUpsert.mockRejectedValue(new Error('unavailable'));
    const res = await request(app).post('/api/resume/save').send(resumeBody('c1', 'ann@x.com', 'Ann', ['go']));
    expect(res.status).toBe(500);
    expect(res.body.details).toEqual(['VECTOR_DB_ERROR']);
  });
});
