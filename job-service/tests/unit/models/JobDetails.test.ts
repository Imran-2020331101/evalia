import { describe, it, expect, vi, afterEach } from 'vitest';
import JobDetailsModelDefault, { JobDetailsModel } from '../../../src/models/JobDetails';

const item = (type = 'high', category = 'Tech', description = 'd') => ({ type, category, description });
const base = (o: any = {}) => ({
  title: '  Dev  ',
  jobDescription: 'desc',
  jobType: 'FULL_TIME',
  workPlaceType: 'REMOTE',
  employmentLevel: 'MID',
  deadline: new Date(Date.now() + 5 * 86400000),
  salary: { from: 10, to: 20 },
  skills: [item('high', 'Backend'), item('low', 'backend'), item('low', 'DevOps')],
  requirements: [item('critical'), item('low')],
  ...o,
});

afterEach(() => vi.restoreAllMocks());

describe('JobDetails model', () => {
  it('default export is the model', () => {
    expect(JobDetailsModelDefault).toBe(JobDetailsModel);
  });

  it('applies defaults and trims strings', () => {
    const d: any = new JobDetailsModel(base());
    expect(d.validateSync()).toBeUndefined();
    expect(d.title).toBe('Dev');
    expect(d.status).toBe('ACTIVE');
    expect(d.views).toBe(0);
    expect(d.featured).toBe(false);
    expect(d.applications).toHaveLength(0);
    expect(d.interviewQA).toHaveLength(0);
  });

  it('rejects an invalid status', () => {
    expect((new JobDetailsModel(base({ status: 'NOPE' })) as any).validateSync()?.errors.status).toBeDefined();
  });

  it('rejects an invalid application status and applies application defaults', () => {
    const bad: any = new JobDetailsModel(base({ applications: [{ candidateEmail: 'a@b.c', status: 'X' }] }));
    expect(Object.keys(bad.validateSync().errors)[0]).toMatch(/applications\.0\.status/);
    const ok: any = new JobDetailsModel(base({ applications: [{ candidateEmail: 'a@b.c' }] }));
    expect(ok.applications[0].status).toBe('PENDING');
    expect(ok.applications[0].appliedAt).toBeInstanceOf(Date);
  });

  describe('virtuals', () => {
    it('daysUntilDeadline: ceil of days, null when no deadline', () => {
      expect((new JobDetailsModel(base()) as any).daysUntilDeadline).toBe(5);
      expect((new JobDetailsModel(base({ deadline: undefined })) as any).daysUntilDeadline).toBeNull();
    });
    it('applicationCount', () => {
      const d: any = new JobDetailsModel(base({ applications: [{ candidateEmail: 'a' }, { candidateEmail: 'b' }] }));
      expect(d.applicationCount).toBe(2);
      expect((new JobDetailsModel(base()) as any).applicationCount).toBe(0);
    });
    it('salaryRange formats salary (and is never null because salary is a nested object)', () => {
      expect((new JobDetailsModel(base()) as any).salaryRange).toBe('$10k - $20k');
    });
    it('toJSON includes virtuals', () => {
      expect((new JobDetailsModel(base()) as any).toJSON()).toHaveProperty('applicationCount', 0);
    });
  });

  describe('instance methods', () => {
    it('isActive requires ACTIVE status and a future deadline', () => {
      expect((new JobDetailsModel(base()) as any).isActive()).toBe(true);
      expect((new JobDetailsModel(base({ status: 'FILLED' })) as any).isActive()).toBe(false);
      expect((new JobDetailsModel(base({ deadline: new Date(Date.now() - 1000) })) as any).isActive()).toBe(false);
    });
    it('getRequirementsByImportance / getSkillsByImportance filter by type', () => {
      const d: any = new JobDetailsModel(base());
      expect(d.getRequirementsByImportance('critical')).toHaveLength(1);
      expect(d.getRequirementsByImportance('optional')).toHaveLength(0);
      expect(d.getSkillsByImportance('low')).toHaveLength(2);
    });
  });

  describe('findByFilters static', () => {
    it('builds an ACTIVE-only query by default', () => {
      const find = vi.spyOn(JobDetailsModel, 'find').mockReturnValue('q' as any);
      expect(JobDetailsModel.findByFilters({})).toBe('q');
      expect(find).toHaveBeenCalledWith({ status: 'ACTIVE' });
    });
    it('adds every provided filter', () => {
      const find = vi.spyOn(JobDetailsModel, 'find').mockReturnValue('q' as any);
      JobDetailsModel.findByFilters({
        jobType: 'CONTRACT', workPlaceType: 'HYBRID', employmentLevel: 'SENIOR',
        location: 'dha', salaryMin: 5, salaryMax: 50,
      });
      const q: any = find.mock.calls[0][0];
      expect(q).toMatchObject({
        status: 'ACTIVE', jobType: 'CONTRACT', workPlaceType: 'HYBRID', employmentLevel: 'SENIOR',
        'salary.from': { $gte: 5 }, 'salary.to': { $lte: 50 },
      });
      expect(q.jobLocation).toEqual(/dha/i);
    });
  });

  describe('pre-save hook', () => {
    const runPreSave = (doc: any) =>
      new Promise<void>((resolve, reject) =>
        (JobDetailsModel.schema as any).s.hooks.execPre('save', doc, [], (e: any) => (e ? reject(e) : resolve())));

    it('derives lowercase unique tags from job fields and skill categories when none set', async () => {
      const doc: any = new JobDetailsModel(base());
      await runPreSave(doc);
      expect([...doc.tags]).toEqual(['full_time', 'remote', 'mid', 'backend', 'devops']);
    });

    it('skips missing fields', async () => {
      const doc: any = new JobDetailsModel({ skills: [] });
      await runPreSave(doc);
      expect([...doc.tags]).toEqual([]);
    });

    it('keeps explicit tags untouched', async () => {
      const doc: any = new JobDetailsModel(base({ tags: ['custom'] }));
      await runPreSave(doc);
      expect([...doc.tags]).toEqual(['custom']);
    });
  });
});
