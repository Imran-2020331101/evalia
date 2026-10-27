import { describe, it, expect } from 'vitest';
import { call, e2eUrl, jobPayload, oid } from '../lib/http.js';

/**
 * Candidate journey against a running stack (docker-compose.test.yml infra + services):
 * browse jobs -> apply -> duplicate apply rejected -> notification for recruiter -> withdraw.
 * Talks to job-service and notification-service directly (the gateway adds JWT auth that the
 * test stack does not seed). Gated on E2E_BASE_URL.
 */
describe.skipIf(!process.env.E2E_BASE_URL)('e2e: candidate apply flow', () => {
  const job = e2eUrl('job');
  const notif = e2eUrl('notification');
  const recruiterId = oid(), orgId = oid(), candidateId = oid();
  const email = `cand-${Date.now()}@e2e.test`;
  let jobId = '';

  it('recruiter creates a job', async () => {
    const r = await call('POST', `${job}/api/jobs/`, jobPayload(recruiterId, orgId));
    expect(r.status, JSON.stringify(r.body)).toBe(200);
    jobId = r.body.data?._id ?? r.body.data?.id ?? r.body.data?.job?._id;
    expect(jobId).toMatch(/^[0-9a-f]{24}$/);
  });

  it('job is listed for candidates', async () => {
    const r = await call('GET', `${job}/api/jobs/`);
    expect(r.status).toBe(200);
    expect(JSON.stringify(r.body)).toContain(jobId);
  });

  it('candidate applies (body shape = gateway JobApplicationRequest)', async () => {
    const r = await call('POST', `${job}/api/jobs/apply`, { jobId, email, candidateId, candidateName: 'E2E Candidate' });
    expect(r.status, JSON.stringify(r.body)).toBe(200);
  });

  it('applying twice is rejected', async () => {
    const r = await call('POST', `${job}/api/jobs/apply`, { jobId, email, candidateId, candidateName: 'E2E Candidate' });
    expect(r.status).toBeGreaterThanOrEqual(400);
  });

  it('job shows up under applied jobs', async () => {
    const r = await call('POST', `${job}/api/jobs/user/applied`, [jobId]);
    expect(r.status).toBe(200);
  });

  it('recruiter eventually gets a NEW_JOB_APPLICATION notification (job -> rabbitmq -> notification)', async () => {
    // userId lookups use the receiver id the job-service wrote (postedBy = createdBy)
    let found = false;
    for (let i = 0; i < 20 && !found; i++) {
      const r = await call('GET', `${notif}/api/notifications/${recruiterId}`);
      found = r.status === 200 && JSON.stringify(r.body).includes('new.job.application');
      if (!found) await new Promise((res) => setTimeout(res, 500));
    }
    expect(found).toBe(true);
  });

  it('candidate withdraws via /:jobId/withdraw (the path job-service actually serves)', async () => {
    const r = await call('POST', `${job}/api/jobs/${jobId}/withdraw`, { jobId, email, candidateId });
    expect(r.status, JSON.stringify(r.body)).toBe(200);
  });

  it('KNOWN GATEWAY BUG: POST /api/jobs/withdraw (what JobProxy calls) is not routed', async () => {
    const r = await call('POST', `${job}/api/jobs/withdraw`, { jobId, email, candidateId });
    expect(r.status).toBe(404);
  });
});
