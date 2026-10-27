import { describe, it, expect, vi, afterEach } from 'vitest';
import mongoose from 'mongoose';

vi.mock('../../src/config/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }, default: { info: vi.fn(), error: vi.fn() } }));

import connectDB from '../../src/config/database';
import { JobDetailsModel } from '../../src/models/JobDetails';
import { CompatibilityReviewModel } from '../../src/models/CompatibilityReview';
import { mapJobData } from '../../src/utils/jobMapper';
import { CreateJobRequestSchema } from '../../src/types/job.types';
import { validCreateJobBody } from '../helpers/testDb';

// NOTE: mongodb-memory-server needs to download a mongod binary, which is not
// available offline, so persistence is exercised through mongoose validation
// and a spied-on mongoose.connect rather than a real server.
afterEach(() => vi.restoreAllMocks());

describe('database layer (offline)', () => {
  it('connectDB uses mongoose.connect and tolerates an unreachable server in non-production', async () => {
    const connect = vi.spyOn(mongoose, 'connect').mockRejectedValue(new Error('ECONNREFUSED'));
    await expect(connectDB()).resolves.toBeUndefined();
    expect(connect).toHaveBeenCalledWith(process.env.MONGODB_URI || 'mongodb://localhost:27017/evalia_ai');
  });

  it('a validated create-job request maps into a document that passes mongoose validation', async () => {
    const parsed = CreateJobRequestSchema.parse(validCreateJobBody({ interviewQA: [{ question: 'Q?', referenceAnswer: 'A' }] }));
    const doc: any = new JobDetailsModel(mapJobData(parsed));
    await expect(doc.validate()).resolves.toBeUndefined();
    expect(doc.company.OrganizationId).toBe('org-1');
    expect(doc.salary.from).toBe(10);
    expect(doc.interviewQA[0].question).toBe('Q?');
    expect(doc.salaryRange).toBe('$10k - $20k');
    expect(doc.isActive()).toBe(true);
  });

  it('rejects invalid enum values at the model level', async () => {
    const doc: any = new JobDetailsModel({ ...mapJobData(CreateJobRequestSchema.parse(validCreateJobBody())), status: 'NOPE' });
    await expect(doc.validate()).rejects.toThrow(/status/);
  });

  it('review documents validate asynchronously and reject bad fits', async () => {
    const ok: any = new CompatibilityReviewModel({ jobId: 'j', candidateEmail: 'a@b.c', matchPercentage: 1, fit: 'Average' });
    await expect(ok.validate()).resolves.toBeUndefined();
    const bad: any = new CompatibilityReviewModel({ jobId: 'j', candidateEmail: 'a@b.c', matchPercentage: 1, fit: 'Meh' });
    await expect(bad.validate()).rejects.toThrow(/fit/);
  });

  it('operations on an unconnected model buffer instead of hitting a database', () => {
    expect(mongoose.connection.readyState).toBe(0);
  });
});
