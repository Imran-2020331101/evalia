import { describe, it, expect } from 'vitest';
import { call, e2eUrl, eventually, oid } from '../lib/http.js';

/**
 * Interview lifecycle against interview_engine (+ notification-service for the in-app event):
 * schedule -> fetch by id / user / job+candidate -> in-app notification -> input validation.
 * Transcript mapping and evaluation need an LLM key, so they are only checked for routing (not 404).
 */
describe.skipIf(!process.env.E2E_BASE_URL)('e2e: interview flow', () => {
  const iv = e2eUrl('interview');
  const notif = e2eUrl('notification');
  const candidateId = oid(), jobId = oid(), orgId = oid();
  const email = `iv-${Date.now()}@e2e.test`;
  let interviewId = '';

  it('rejects an invalid schedule request with 4xx', async () => {
    const r = await call('POST', `${iv}/api/interview`, { candidate: { id: candidateId } });
    expect(r.status).toBeGreaterThanOrEqual(400);
    expect(r.status).toBeLessThan(500);
  });

  it('schedules an interview (body = job-service sendInterviewInvitation)', async () => {
    const r = await call('POST', `${iv}/api/interview`, {
      candidate: { id: candidateId, email, name: 'E2E Candidate' },
      job: { id: jobId, title: 'E2E Engineer', interviewQA: [{ question: 'Q1', referenceAnswer: 'A1' }, { question: 'Q2' }] },
      organization: { id: orgId },
      deadline: new Date(Date.now() + 7 * 864e5).toISOString(),
    });
    expect(r.status, JSON.stringify(r.body)).toBe(201);
    interviewId = r.body.data.interviewId;
    expect(r.body.data).toMatchObject({ jobId, candidateId, totalQuestions: 2, status: 'SCHEDULED' });
  });

  it('is retrievable by id, user and job+candidate (gateway InterviewProxy paths)', async () => {
    expect((await call('GET', `${iv}/api/interview/${interviewId}`)).status).toBe(200);
    expect((await call('GET', `${iv}/api/interview/user/${candidateId}`)).status).toBe(200);
    expect((await call('GET', `${iv}/api/interview/job/${jobId}/candidate/${candidateId}`)).status).toBe(200);
  });

  it('candidate receives an in-app "interview scheduled" notification', async () => {
    const r = await eventually(async () => {
      const g = await call('GET', `${notif}/api/notifications/${encodeURIComponent(candidateId)}`);
      return g.status === 200 && JSON.stringify(g.body).includes('interview_scheduled') ? g : undefined;
    });
    expect(r.status).toBe(200);
  });

  it('transcript + evaluation routes exist (no 404 for a real interview id)', async () => {
    const t = await call('PUT', `${iv}/api/interview/${interviewId}/transcript`, { transcript: [{ role: 'user', text: 'hello' }] });
    expect(t.status).not.toBe(404);
    const e = await call('GET', `${iv}/api/interview/${interviewId}/evaluation`);
    expect(e.status).not.toBe(404);
  });

  it('KNOWN GATEWAY BUG: GET /api/interview/ (getAllInterviews) is not served', async () => {
    const r = await call('GET', `${iv}/api/interview/`);
    expect([404, 405]).toContain(r.status);
  });
});
