import { describe, it, expect } from 'vitest';
import { OverviewSchema } from '../../../src/types/compatibility.types';
import { CreateJobRequestSchema, JobFilterSchema, SalarySchema, JobDetailsSchema } from '../../../src/types/job.types';
import { validCreateJobBody } from '../../helpers/testDb';

describe('OverviewSchema', () => {
  const ok = { matchPercentage: 80, fit: 'Good Fit', strength: ['a'], weakness: [] };
  it('accepts a valid overview', () => expect(OverviewSchema.safeParse(ok).success).toBe(true));
  it('rejects unknown fit values and wrong types', () => {
    expect(OverviewSchema.safeParse({ ...ok, fit: 'Great' }).success).toBe(false);
    expect(OverviewSchema.safeParse({ ...ok, matchPercentage: '80' }).success).toBe(false);
  });
});

describe('CreateJobRequestSchema', () => {
  it('turns null organization id/email into defaults', () => {
    const r = CreateJobRequestSchema.parse(validCreateJobBody({ companyInfo: { organizationId: null, organizationEmail: null } }));
    expect(r.companyInfo).toEqual({ organizationId: 'unknown', organizationEmail: 'unknown@company.com' });
  });
  it('rejects salaryTo < salaryFrom', () => {
    const b = validCreateJobBody();
    b.basic.salaryFrom = 50;
    expect(CreateJobRequestSchema.safeParse(b).success).toBe(false);
  });
});

describe('JobFilterSchema', () => {
  it('applies defaults', () => {
    expect(JobFilterSchema.parse({})).toEqual({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });
  });
  it('parses numeric strings and enforces bounds', () => {
    expect(JobFilterSchema.parse({ page: '3', limit: '50' })).toMatchObject({ page: 3, limit: 50 });
    expect(JobFilterSchema.safeParse({ limit: '101' }).success).toBe(false);
    expect(JobFilterSchema.safeParse({ page: '0' }).success).toBe(false);
  });
});

describe('SalarySchema / JobDetailsSchema', () => {
  it('requires to >= from', () => {
    expect(SalarySchema.safeParse({ from: 5, to: 1 }).success).toBe(false);
    expect(SalarySchema.safeParse({ from: 1, to: 5 }).success).toBe(true);
  });
  it('requires a future deadline', () => {
    const item = { type: 'high', category: 'c', description: 'd' };
    const base: any = {
      title: 't', jobDescription: 'd', jobLocation: 'l', salary: { from: 1, to: 2 }, deadline: new Date(Date.now() + 1e6),
      jobType: 'CONTRACT', workPlaceType: 'HYBRID', employmentLevel: 'ENTRY',
      requirements: [item], responsibilities: [item], skills: [item], postedBy: 'u', company: { OrganizationId: 'o' },
    };
    expect(JobDetailsSchema.safeParse(base).success).toBe(true);
    expect(JobDetailsSchema.safeParse({ ...base, deadline: new Date(Date.now() - 1e6) }).success).toBe(false);
  });
});
