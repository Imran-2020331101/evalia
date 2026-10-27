import { describe, it, expect, vi } from 'vitest';

const get = vi.hoisted(() => vi.fn());
vi.mock('axios', () => ({ default: { get } }));

import { JobService, jobService } from '../../../src/services/JobService';

describe('JobService', () => {
  it('exports a singleton instance', () => {
    expect(jobService).toBeInstanceOf(JobService);
  });

  it('constructor reads JOB_SERVICE_URL, defaulting to localhost:7000', () => {
    expect((new JobService() as any).baseUrl).toBe('http://job-service.test');
    const saved = process.env.JOB_SERVICE_URL;
    delete process.env.JOB_SERVICE_URL;
    try {
      expect((new JobService() as any).baseUrl).toBe('http://localhost:7000');
    } finally {
      process.env.JOB_SERVICE_URL = saved;
    }
  });

  it('fetches the job and returns response.data', async () => {
    get.mockResolvedValue({ data: { success: true, data: { id: 'j1' } } });
    const r = await new JobService().getJobById('j1');
    expect(get).toHaveBeenCalledWith('http://job-service.test/api/jobs/j1');
    expect(r).toEqual({ success: true, data: { id: 'j1' } });
  });

  it('translates a 404 into "Job not found"', async () => {
    get.mockRejectedValue({ response: { status: 404 }, message: 'x' });
    await expect(new JobService().getJobById('j')).rejects.toThrow('Job not found');
  });

  it('wraps other failures', async () => {
    get.mockRejectedValue({ response: { status: 500 }, message: 'boom' });
    await expect(new JobService().getJobById('j')).rejects.toThrow('Failed to fetch job: boom');
  });

  it('wraps network errors without a response', async () => {
    get.mockRejectedValue(new Error('ECONNRESET'));
    await expect(new JobService().getJobById('j')).rejects.toThrow('Failed to fetch job: ECONNRESET');
  });

  // BUG (source): getJobById builds the URL from process.env.JOB_SERVICE_URL directly,
  // ignoring this.baseUrl, so the localhost:7000 default is never used.
  it('ignores the baseUrl default when env var is unset (URL becomes "undefined/...")', async () => {
    const saved = process.env.JOB_SERVICE_URL;
    delete process.env.JOB_SERVICE_URL;
    get.mockResolvedValue({ data: {} });
    try {
      await new JobService().getJobById('j9');
      expect(get).toHaveBeenCalledWith('undefined/api/jobs/j9');
    } finally {
      process.env.JOB_SERVICE_URL = saved;
    }
  });
});
