import { describe, it, expect } from 'vitest';
import {
  ResumeDTO, UploadResumeSchema, ExtractDetailsSchema, SaveResumeSchema, ContactSchema,
  IndustryTypeSchema, SearchCandidatesSchema, GetResumeByEmailSchema, ResumeIdSchema, SkillsSchema,
} from '../../../src/types/resume.types';
import * as job from '../../../src/types/job.types';

describe('ResumeDTO', () => {
  const full = {
    filename: 'f.pdf', fileLink: 'http://x', industry: 'STEM & Technical',
    skills: { technical: ['ts'], soft: ['s'] },
    experience: [{ job_title: 'a' }], education: [{ degree: 'b' }], projects: [{ title: 'p' }],
    email: 'a@b.co', phone: '1', linkedin: 'l', github: 'g', location: 'x',
    certifications: [{}], awards: [{}], volunteer: ['v'], interests: ['i'],
    wordCount: 10, characterCount: 50, hasPhone: true, keywords: ['k'],
  };

  it('constructs with defaults from empty data', () => {
    const d = new ResumeDTO({});
    expect(d.industry).toBe('Others');
    expect(d.status).toBe('completed');
    expect(d.contact.email).toBe('');
    expect(d.skills.other).toEqual([]);
    expect(d.uploadedBy).toBe('');
    expect(d.processedAt).toBeInstanceOf(Date);
    expect(d.metadata).toEqual({ pages: 0, info: null, version: '1.0' });
  });

  it('constructs from full data', () => {
    const d = new ResumeDTO(full);
    expect(d.contact).toEqual({ email: 'a@b.co', phone: '1', linkedin: 'l', github: 'g', location: 'x' });
    expect(d.analysis).toEqual({ wordCount: 10, characterCount: 50, hasPhone: true, keywords: ['k'] });
    expect(d.volunteer).toEqual(['v']);
  });

  it('validate: flags missing filename/fileLink and bad email', () => {
    const d = new ResumeDTO({});
    expect(d.validate()).toEqual({ isValid: false, errors: ['filename is required', 'fileLink is required'] });
    d.contact.email = 'not-an-email';
    expect(d.validate().errors).toContain('Invalid email format');
  });

  it('validate: passes for a good dto', () => {
    expect(new ResumeDTO(full).validate()).toEqual({ isValid: true, errors: [] });
  });

  it('toObject returns the public fields only', () => {
    const o = new ResumeDTO(full).toObject();
    expect(Object.keys(o).sort()).toEqual(['awards', 'certifications', 'contact', 'education', 'experience',
      'fileLink', 'filename', 'industry', 'interests', 'projects', 'skills', 'status', 'volunteer'].sort());
  });

  it('getSummary computes counts and completeness', () => {
    const s = new ResumeDTO(full).getSummary();
    expect(s).toMatchObject({ hasContact: true, skillsCount: 2, experienceCount: 1, educationCount: 1,
      projectsCount: 1, certificationsCount: 1, completeness: 100 });
    const e = new ResumeDTO({}).getSummary();
    expect(e.hasContact).toBe(false);
    expect(e.completeness).toBe(0);
  });

  it('fromObject / fromArray', () => {
    expect(ResumeDTO.fromObject(full)).toBeInstanceOf(ResumeDTO);
    const arr = ResumeDTO.fromArray([full, {}]);
    expect(arr).toHaveLength(2);
    expect(arr[1].filename).toBeUndefined();
  });
});

describe('zod schemas', () => {
  it('UploadResumeSchema', () => {
    expect(UploadResumeSchema.parse({ userEmail: 'a@b.co', userId: '1' })).toEqual({ userEmail: 'a@b.co', userId: '1' });
    expect(() => UploadResumeSchema.parse({ userEmail: 'bad', userId: '1' })).toThrow();
    expect(() => UploadResumeSchema.parse({ userEmail: 'a@b.co', userId: '' })).toThrow();
  });
  it('ExtractDetailsSchema', () => {
    expect(ExtractDetailsSchema.safeParse({ resumeURL: 'http://x.com/a', userEmail: 'e', userId: 'u' }).success).toBe(true);
    expect(ExtractDetailsSchema.safeParse({ resumeURL: 'nope', userEmail: 'e', userId: 'u' }).success).toBe(false);
  });
  it('IndustryTypeSchema accepts enum or empty string', () => {
    expect(IndustryTypeSchema.safeParse('Others').success).toBe(true);
    expect(IndustryTypeSchema.safeParse('').success).toBe(true);
    expect(IndustryTypeSchema.safeParse('Other').success).toBe(false);
  });
  it('ContactSchema/SkillsSchema apply defaults', () => {
    // BUG: the "" default for email is itself rejected by .email().
    expect(ContactSchema.safeParse({}).success).toBe(false);
    expect(ContactSchema.parse({ email: 'a@b.co' })).toEqual({ email: 'a@b.co', phone: '', linkedin: '', github: '', location: '' });
    expect(SkillsSchema.parse({}).technical).toEqual([]);
  });
  it('SaveResumeSchema parses a minimal valid payload and applies defaults', () => {
    // BUG: omitting `contact` fails, because ContactSchema defaults email to "" which then fails .email().
    expect(SaveResumeSchema.safeParse({
      resumeData: { filename: 'f', fileLink: 'http://x.com/f', uploadedBy: 'a@b.co' },
      userId: 'u', userName: 'n',
    }).success).toBe(false);
    const r = SaveResumeSchema.parse({
      resumeData: { filename: 'f', fileLink: 'http://x.com/f', uploadedBy: 'a@b.co', contact: { email: 'a@b.co' } },
      userId: 'u', userName: 'n',
    });
    expect(r.resumeData.status).toBe('completed');
    expect(r.resumeData.experience).toEqual([]);
    expect(SaveResumeSchema.safeParse({ resumeData: {}, userId: '', userName: '' }).success).toBe(false);
  });
  it('misc schemas', () => {
    expect(GetResumeByEmailSchema.safeParse({ email: 'x' }).success).toBe(false);
    expect(SearchCandidatesSchema.safeParse({ job_description: 'short' }).success).toBe(false);
    expect(SearchCandidatesSchema.safeParse({ job_description: 'long enough text' }).success).toBe(true);
    expect(ResumeIdSchema.safeParse({ id: '' }).success).toBe(false);
  });
});

describe('job.types schemas', () => {
  it('enums validate', () => {
    expect(job.ImportanceLevel.safeParse('critical').success).toBe(true);
    expect(job.JobType.safeParse('FULL_TIME').success).toBe(true);
    expect(job.WorkplaceType.safeParse('MOON').success).toBe(false);
    expect(job.JobStatus.safeParse('ACTIVE').success).toBe(true);
    expect(job.ApplicationStatus.safeParse('HIRED').success).toBe(true);
    expect(job.EmploymentLevel.safeParse('SENIOR').success).toBe(true);
  });
  it('object schemas validate', () => {
    expect(job.SalarySchema.safeParse({ from: 1, to: 2 }).success).toBe(true);
    expect(job.SalarySchema.safeParse({ from: -1, to: 2 }).success).toBe(false);
    expect(job.CompanySchema.safeParse({ OrganizationId: 'o' }).success).toBe(true);
    expect(job.ApplicationSchema.safeParse({ candidateId: 'c', candidateName: 'n', candidateEmail: 'e' }).success).toBe(true);
  });

  const item = { type: 'high', category: 'c', description: 'd' };
  const validJob = () => ({
    title: ' T ', jobDescription: 'desc', jobLocation: 'NYC', salary: { from: 1, to: 2 },
    deadline: new Date(Date.now() + 86400000), jobType: 'FULL_TIME', workPlaceType: 'REMOTE', employmentLevel: 'MID',
    requirements: [item], responsibilities: [item], skills: [item], postedBy: 'p', company: { OrganizationId: 'o' },
  });

  it('JobDetailsSchema applies defaults, trims and checks the deadline', () => {
    const r = job.JobDetailsSchema.parse(validJob());
    expect(r.title).toBe('T');
    expect(r).toMatchObject({ status: 'ACTIVE', applications: [], views: 0, featured: false, tags: [] });
    expect(job.JobDetailsSchema.safeParse({ ...validJob(), deadline: new Date(0) }).success).toBe(false);
    expect(job.JobDetailsSchema.safeParse({ ...validJob(), skills: [] }).success).toBe(false);
  });

  it('InterviewQuestionsGenerateSchema passes through extra keys', () => {
    expect(job.InterviewQuestionsGenerateSchema.parse({ jobDescription: 'x', extra: 1 })).toEqual({ jobDescription: 'x', extra: 1 });
  });

  it('CreateJobRequestSchema transforms nulls and enforces salary order', () => {
    const base = {
      companyInfo: { organizationId: null, organizationEmail: null },
      basic: { title: 't', jobDescription: 'd', jobLocation: 'l', salaryFrom: 1, salaryTo: 2, deadline: '2030-01-01', jobType: 'CONTRACT', workPlaceType: 'HYBRID', employmentLevelType: 'ENTRY' },
      requirements: [item], responsibilities: [item], skills: [item],
    };
    const ok = job.CreateJobRequestSchema.parse(base);
    expect(ok.companyInfo).toEqual({ organizationId: 'unknown', organizationEmail: 'unknown@company.com' });
    const bad = job.CreateJobRequestSchema.safeParse({ ...base, basic: { ...base.basic, salaryFrom: 5, salaryTo: 1 } });
    expect(bad.success).toBe(false);
  });

  it('JobFilterSchema parses paging with defaults', () => {
    expect(job.JobFilterSchema.parse({})).toEqual({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });
    expect(job.JobFilterSchema.parse({ page: '3', limit: '50', sortOrder: 'asc', status: 'ACTIVE' })).toMatchObject({ page: 3, limit: 50, sortOrder: 'asc', status: 'ACTIVE' });
    expect(job.JobFilterSchema.safeParse({ limit: '1000' }).success).toBe(false);
  });
});
