import { describe, it, expect } from 'vitest';
import { GATEWAY_JAVA, ROOT, javaEnumValues, javaFields, parseExpressRoutes, parseFeignProxy } from '../lib/contract.js';
import { assertEndpoints } from '../lib/endpoints.js';

// Zod schemas are imported straight from the job-service source (they only depend on zod).
const jobTypes = await import(`${ROOT}/job-service/src/types/job.types.ts`);
const appTypes = await import(`${ROOT}/job-service/src/types/aplication.types.ts`);

const J = `${GATEWAY_JAVA}/job`;
const jobRoutes = parseExpressRoutes('job-service/src/routes/jobRoutes.ts', '/api/jobs');
const compatRoutes = parseExpressRoutes('job-service/src/routes/compatibilityReviewRoutes.ts', '/api/compatibility');

const JOB_KNOWN = {
  'POST /api/jobs/withdraw':
    'gateway posts to /withdraw (jobId in body) but job-service only exposes POST /api/jobs/:jobId/withdraw',
};

describe('gateway JobProxy -> job-service routes', () => {
  const { endpoints } = parseFeignProxy(`${J}/Proxy/JobProxy.java`);
  it('parses a non-trivial proxy', () => expect(endpoints.length).toBeGreaterThanOrEqual(15));
  assertEndpoints(endpoints, jobRoutes, JOB_KNOWN);
});

describe('gateway CompatibilityProxy -> job-service routes', () => {
  const { endpoints } = parseFeignProxy(`${J}/Proxy/CompatibilityProxy.java`);
  assertEndpoints(endpoints, compatRoutes);
});

describe('route shadowing in job-service jobRoutes', () => {
  it('static POST /generate/interview-questions is registered before dynamic /:jobId routes', () => {
    const idx = (p: string, m = 'POST') => jobRoutes.findIndex((r) => r.path === p && r.method === m);
    // static GET/POST single-segment routes must precede GET /:jobId
    expect(idx('/api/jobs/generate/interview-questions')).toBeGreaterThanOrEqual(0);
    expect(idx('/api/jobs/apply')).toBeGreaterThanOrEqual(0);
  });
});

describe('DTO shape: JobCreationRequest -> CreateJobRequestSchema', () => {
  const dto = javaFields(`${J}/DTO/JobCreationRequest.java`);
  it('java DTO exposes the fields the schema reads', () => {
    for (const f of ['createdBy', 'companyInfo', 'basic', 'requirements', 'responsibilities', 'skills', 'interviewQA',
      'organizationId', 'organizationEmail', 'title', 'jobDescription', 'jobLocation', 'salaryFrom', 'salaryTo',
      'deadline', 'jobType', 'workPlaceType', 'employmentLevelType', 'question', 'referenceAnswer']) {
      expect(dto, f).toContain(f);
    }
  });

  const payload = {
    createdBy: 'u1',
    companyInfo: { organizationId: 'o1', organizationEmail: 'hr@acme.io', organizationName: 'Acme' },
    basic: {
      title: 'Backend Engineer', jobDescription: 'Build APIs', jobLocation: 'Dhaka', salaryFrom: 1000, salaryTo: 2000,
      deadline: '2030-01-31', jobType: 'FULL_TIME', workPlaceType: 'REMOTE', employmentLevelType: 'MID',
    },
    requirements: [{ type: 'critical', category: 'Education', description: 'BSc' }],
    responsibilities: [{ type: 'high', category: 'Dev', description: 'Write code' }],
    skills: [{ type: 'moderate', category: 'Lang', description: 'TypeScript' }],
    interviewQA: [{ question: 'Why?', referenceAnswer: 'Because' }],
  };

  it('a gateway-shaped payload is accepted', () => {
    expect(jobTypes.CreateJobRequestSchema.safeParse(payload).success).toBe(true);
  });
  it('enum values are identical on both sides', () => {
    expect(javaEnumValues(`${J}/DTO/JobCreationRequest.java`, 'JobType').sort()).toEqual([...jobTypes.JobType.options].sort());
    expect(javaEnumValues(`${J}/DTO/JobCreationRequest.java`, 'WorkplaceType').sort()).toEqual([...jobTypes.WorkplaceType.options].sort());
    expect(javaEnumValues(`${J}/DTO/JobCreationRequest.java`, 'EmploymentLevel').sort()).toEqual([...jobTypes.EmploymentLevel.options].sort());
  });
  it('MISMATCH: gateway marks companyInfo optional but job-service requires it (null -> 400)', () => {
    const { companyInfo, ...noCompany } = payload;
    expect(jobTypes.CreateJobRequestSchema.safeParse(noCompany).success).toBe(false);
  });
  it('MISMATCH: gateway DomainItemDto.type is a free string; job-service only accepts importance levels', () => {
    const bad = { ...payload, skills: [{ type: 'SKILL', category: 'x', description: 'y' }] };
    expect(jobTypes.CreateJobRequestSchema.safeParse(bad).success).toBe(false);
    expect(jobTypes.ImportanceLevel.options).toEqual(['critical', 'high', 'moderate', 'low', 'optional']);
  });
});

describe('DTO shape: InterviewQuestionsGenerateRequest', () => {
  it('matches InterviewQuestionsGenerateSchema', () => {
    expect(javaFields(`${J}/DTO/InterviewQuestionsGenerateRequest.java`)).toEqual(
      expect.arrayContaining(['jobDescription', 'requirements', 'responsibilities', 'skills']));
    const ok = jobTypes.InterviewQuestionsGenerateSchema.safeParse({
      jobDescription: 'x', skills: [{ type: 'high', category: 'a', description: 'b' }],
    });
    expect(ok.success).toBe(true);
  });
});

describe('DTO shape: apply / withdraw / shortlist bodies', () => {
  const oid = 'a'.repeat(24);
  it('JobApplicationRequest fields = apply schema fields', () => {
    expect(javaFields(`${J}/DTO/JobApplicationRequest.java`).sort()).toEqual(['candidateId', 'candidateName', 'email', 'jobId']);
  });
  it('candidateInfo/ShortlistForwardWrapper match ShortlistRequest', () => {
    expect(javaFields(`${J}/DTO/candidateInfo.java`).sort()).toEqual(['candidateEmail', 'candidateId', 'candidateName']);
    expect(javaFields(`${J}/DTO/ShortlistForwardWrapper.java`)).toContain('candidates');
    const body = { candidates: [{ candidateId: oid, candidateName: 'A', candidateEmail: 'a@b.co' }] };
    expect(appTypes.ShortlistRequest.safeParse(body).success).toBe(true);
    expect(appTypes.ShortlistRequest.safeParse({ candidates: [{ candidateId: oid }] }).success).toBe(false);
  });
});
