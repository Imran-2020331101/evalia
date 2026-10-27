import { describe, it, expect } from 'vitest';
import { call, e2eUrl, eventually, jobPayload, oid } from '../lib/http.js';

/**
 * Recruiter pipeline: create job -> candidates apply -> shortlist (job-service schedules an interview
 * in interview_engine and queues an email) -> finalist -> reject the rest.
 * Requires job-service, interview_engine, notification-service, mongo and rabbitmq. Email sending
 * itself is not asserted (SMTP is not part of the test stack).
 */
describe.skipIf(!process.env.E2E_BASE_URL)('e2e: recruiter hiring flow', () => {
  const job = e2eUrl('job');
  const interview = e2eUrl('interview');
  const recruiterId = oid(), orgId = oid();
  const cands = [0, 1].map((i) => ({
    candidateId: oid(), candidateName: `E2E Cand ${i}`, candidateEmail: `hire-${i}-${Date.now()}@e2e.test`,
  }));
  let jobId = '';

  it('create job and receive two applications', async () => {
    const c = await call('POST', `${job}/api/jobs/`, jobPayload(recruiterId, orgId));
    expect(c.status, JSON.stringify(c.body)).toBe(200);
    jobId = c.body.data?._id ?? c.body.data?.id;
    for (const k of cands) {
      const r = await call('POST', `${job}/api/jobs/apply`, { jobId, email: k.candidateEmail, candidateId: k.candidateId, candidateName: k.candidateName });
      expect(r.status, JSON.stringify(r.body)).toBe(200);
    }
  });

  it('organization job list contains the job', async () => {
    const r = await call('GET', `${job}/api/jobs/organization/${orgId}`);
    expect(r.status).toBe(200);
    expect(JSON.stringify(r.body)).toContain(jobId);
  });

  it('shortlist candidate 0 -> interview is scheduled in interview_engine', async () => {
    const r = await call('POST', `${job}/api/jobs/${jobId}/shortlist`, { candidates: [cands[0]] });
    expect(r.status, JSON.stringify(r.body)).toBe(200);
    const iv = await eventually(async () => {
      const g = await call('GET', `${interview}/api/interview/job/${jobId}/candidate/${cands[0].candidateId}`);
      return g.status === 200 ? g : undefined;
    });
    expect(JSON.stringify(iv.body)).toContain(jobId);
  });

  it('reject remaining PENDING candidates', async () => {
    const r = await call('POST', `${job}/api/jobs/${jobId}/reject/status/PENDING`, { candidates: [cands[1]] });
    expect(r.status, JSON.stringify(r.body)).toBe(200);
  });

  it('finalist candidate 0', async () => {
    const r = await call('POST', `${job}/api/jobs/${jobId}/finalist`, { candidates: [cands[0]] });
    expect(r.status, JSON.stringify(r.body)).toBe(200);
  });

  it('delete the job', async () => {
    const r = await call('DELETE', `${job}/api/jobs/${jobId}?email=hr@e2e.test`);
    expect(r.status).toBe(200);
  });
});
