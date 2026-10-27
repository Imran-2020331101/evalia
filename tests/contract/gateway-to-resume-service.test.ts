import { describe, it, expect } from 'vitest';
import { GATEWAY_JAVA, ROOT, javaFields, parseExpressRoutes, parseFeignProxy, read } from '../lib/contract.js';
import { assertEndpoints } from '../lib/endpoints.js';

const R = `${GATEWAY_JAVA}/resume`;
const resumeTypes = await import(`${ROOT}/resume-service/src/types/resume.types.ts`);

const resumeRoutes = parseExpressRoutes('resume-service/src/routes/resumeRoutes.ts', '/api/resume');
const courseRoutes = parseExpressRoutes('resume-service/src/routes/courseRoutes.ts', '/api/course');

describe('gateway ResumeJsonProxy -> resume-service /api/resume', () => {
  const { endpoints } = parseFeignProxy(`${R}/Proxy/ResumeJsonProxy.java`);
  it('parses all six endpoints', () => expect(endpoints).toHaveLength(6));
  assertEndpoints(endpoints, resumeRoutes, {
    'POST /api/resume/basic-search':
      'gateway calls POST /basic-search but resume-service has no such route (only POST /shortlist/:k); docs list it too',
  });
});

describe('gateway ResumeProxy (multipart upload)', () => {
  const { baseUrl, endpoints } = parseFeignProxy(`${R}/Proxy/ResumeProxy.java`);
  assertEndpoints(endpoints, resumeRoutes);

  it('multipart parts match what resume-service reads (file + userEmail + userId)', () => {
    const src = read(`${R}/Proxy/ResumeProxy.java`);
    for (const part of ['file', 'userEmail', 'userId']) expect(src).toContain(`@RequestPart("${part}")`);
    const route = read('resume-service/src/routes/resumeRoutes.ts');
    expect(route).toMatch(/upload\.single\(['"]file['"]\)/);
    expect(resumeTypes.UploadResumeSchema.safeParse({ userEmail: 'a@b.co', userId: '1' }).success).toBe(true);
  });

  it('MISMATCH (config): base URL is hard-coded, not driven by ${resume.service.url} like the other proxies', () => {
    expect(baseUrl).toBe('http://localhost:5000/api/resume');
  });
});

describe('gateway CourseProxy -> resume-service /api/course', () => {
  const { endpoints } = parseFeignProxy(`${GATEWAY_JAVA}/course/proxy/CourseProxy.java`);
  expect(endpoints).toHaveLength(4);
  assertEndpoints(endpoints, courseRoutes);

  it('CourseDTO carries every field the saveCourse controller destructures', () => {
    const dto = javaFields(`${GATEWAY_JAVA}/course/dto/CourseDTO.java`);
    const ctrl = read('resume-service/src/controllers/courseController.ts');
    for (const f of ['videoId', 'title', 'description', 'channelId', 'channelTitle', 'thumbnails', 'publishedAt']) {
      expect(dto, `java ${f}`).toContain(f);
      expect(ctrl, `controller ${f}`).toContain(f);
    }
  });
});

describe('DTO shape: ResumeForwardWrapper -> extract/save', () => {
  const fields = javaFields(`${R}/DTO/ResumeForwardWrapper.java`);
  it('has resumeData, resumeURL, userId, userName, userEmail', () => {
    expect(fields).toEqual(expect.arrayContaining(['resumeData', 'resumeURL', 'userId', 'userName', 'userEmail']));
  });
  it('extract body satisfies ExtractDetailsSchema', () => {
    const r = resumeTypes.ExtractDetailsSchema.safeParse({
      resumeData: null, resumeURL: 'https://res.cloudinary.com/x/resume.pdf', userId: '507f1f77bcf86cd799439011',
      userName: 'A', userEmail: 'a@b.co',
    });
    expect(r.success).toBe(true);
  });
  it('save controller destructures resumeData,userId,userName,userEmail', () => {
    expect(read('resume-service/src/controllers/resumeController.ts')).toMatch(
      /const \{ resumeData , userId, userName, userEmail \}/);
  });
  it('NOTE: saveResume dereferences resumeData.uploadedBy before its null check (null resumeData -> TypeError 500, not 400)', () => {
    const src = read('resume-service/src/controllers/resumeController.ts');
    expect(src.indexOf('resumeData.uploadedBy = userEmail')).toBeLessThan(src.indexOf("MissingRequiredFieldError('resumeData')"));
  });
});

describe('DTO shape: search + retrieve', () => {
  it('BasicSearchRequest / GlobalSearchRequest use job_description (what searchCandidatesUsingNLP reads)', () => {
    expect(javaFields(`${R}/DTO/BasicSearchRequest.java`)).toEqual(['job_description']);
    expect(javaFields(`${R}/DTO/GlobalSearchRequest.java`)).toEqual(['job_description']);
    expect(read('resume-service/src/controllers/resumeController.ts')).toMatch(/const \{ job_description\} = req\.body/);
  });
  it('retrieve reads ?email= and course suggestions read ?candidateEmail=', () => {
    expect(read('resume-service/src/controllers/resumeController.ts')).toMatch(/const \{ email \} = req\.query/);
    expect(read('resume-service/src/controllers/courseController.ts')).toMatch(/const \{ candidateEmail \} = req\.query/);
    expect(read(`${R}/Proxy/ResumeJsonProxy.java`)).toMatch(/@RequestParam String email/);
    expect(read(`${GATEWAY_JAVA}/course/proxy/CourseProxy.java`)).toMatch(/@RequestParam String candidateEmail/);
  });
});
