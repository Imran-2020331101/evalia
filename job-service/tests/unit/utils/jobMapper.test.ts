import { describe, it, expect } from 'vitest';
import { mapJobData } from '../../../src/utils/jobMapper';
import { CreateJobRequestSchema } from '../../../src/types/job.types';
import { validCreateJobBody } from '../../helpers/testDb';

describe('mapJobData', () => {
  it('maps a parsed request into the model shape', () => {
    const data = CreateJobRequestSchema.parse(validCreateJobBody({ interviewQA: [{ question: 'q?' }] }));
    const m = mapJobData(data);
    expect(m).toMatchObject({
      title: 'Backend Engineer',
      jobLocation: 'Dhaka',
      salary: { from: 10, to: 20 },
      jobType: 'FULL_TIME',
      workPlaceType: 'REMOTE',
      employmentLevel: 'MID',
      postedBy: 'user-1',
      status: 'ACTIVE',
      company: { OrganizationId: 'org-1', OrganizationEmail: 'org@x.com' },
      interviewQA: [{ question: 'q?' }],
    });
    expect(m.deadline).toEqual(new Date('2099-01-01'));
  });

  it('defaults interviewQA to [] and falls back for empty company info', () => {
    const data: any = CreateJobRequestSchema.parse(validCreateJobBody());
    data.companyInfo = { organizationId: '', organizationEmail: '' };
    const m = mapJobData(data);
    expect(m.interviewQA).toEqual([]);
    expect(m.company).toEqual({ OrganizationId: 'unknown', OrganizationEmail: 'unknown@company.com' });
  });
});
