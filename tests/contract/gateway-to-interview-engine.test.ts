import { describe, it, expect } from 'vitest';
import { GATEWAY_JAVA, javaFields, parseExpressRoutes, parseFeignProxy, read } from '../lib/contract.js';
import { assertEndpoints } from '../lib/endpoints.js';

const routes = parseExpressRoutes('interview_engine/src/routes/interview.ts', '/api/interview');

describe('gateway InterviewProxy -> interview_engine /api/interview', () => {
  const { endpoints } = parseFeignProxy(`${GATEWAY_JAVA}/job/Proxy/InterviewProxy.java`);
  it('parses six endpoints', () => expect(endpoints).toHaveLength(6));
  assertEndpoints(endpoints, routes, {
    'GET /api/interview':
      'gateway getAllInterviews() calls GET /api/interview/ but interview_engine only registers POST / (schedule)',
  });
});

describe('route table sanity', () => {
  it('exposes schedule + summary beyond what the gateway proxies', () => {
    const keys = routes.map((r) => `${r.method} ${r.path}`);
    expect(keys).toContain('POST /api/interview');
    expect(keys).toContain('GET /api/interview/:interviewId/summary');
  });
});

describe('transcript DTO', () => {
  it('TranscriptWrapperDTO.transcript[] of {role,text} is what addTranscriptToInterview reads (req.body.transcript)', () => {
    expect(javaFields(`${GATEWAY_JAVA}/job/DTO/TranscriptWrapperDTO.java`)).toEqual(['transcript']);
    expect(javaFields(`${GATEWAY_JAVA}/job/DTO/TranscriptDTO.java`).sort()).toEqual(['role', 'text']);
    expect(read('interview_engine/src/controllers/InterviewController.ts')).toMatch(/const \{ transcript \} = req\.body/);
  });
});

describe('job-service -> interview_engine scheduling call', () => {
  it('job-service POSTs /api/interview with the body shape ScheduleInterviewRequest requires', () => {
    const src = read('job-service/src/services/applicationService.ts');
    expect(src).toMatch(/INTERVIEW_SERVICE_URL\}\/api\/interview`/);
    const schema = read('interview_engine/src/types/interview.types.ts');
    const start = schema.indexOf("export const ScheduleInterviewRequest");
    const block = schema.slice(start, schema.indexOf("export type IScheduleInterviewRequest", start));
    for (const key of ['candidate', 'job', 'organization', 'deadline']) expect(block).toContain(key);
    // keys job-service sends
    for (const key of ['candidate:', 'job:', 'organization', 'deadline:', 'interviewQA']) expect(src).toContain(key);
  });
  it('job-service reads response.data.data.{interviewId,deadline} which the engine returns', () => {
    expect(read('interview_engine/src/controllers/InterviewController.ts')).toMatch(/data\s*:\s*createdInterview/);
  });
});
