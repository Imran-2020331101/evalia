import { describe, it, expect, vi, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { Interview, QAwithReference, InterviewStatus } from '../../../src/models/InterviewSchema';
import { VALID_ID, VALID_ID_2, VALID_ID_3 } from '../../helpers/testDb';

const base = () => ({
  candidateId: VALID_ID,
  candidateEmail: '  Jane@Example.COM ',
  candidateName: ' Jane ',
  jobId: VALID_ID_2,
  jobTitle: 'Dev',
  organizationId: VALID_ID_3,
  deadline: new Date('2030-01-01'),
});

describe('InterviewSchema', () => {
  afterEach(() => vi.restoreAllMocks());

  it('exposes the status enum', () => {
    expect(Object.values(InterviewStatus)).toEqual(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']);
  });

  it('applies defaults, trimming and lowercasing', () => {
    const d = new Interview(base());
    expect(d.validateSync()).toBeUndefined();
    expect(d.candidateEmail).toBe('jane@example.com');
    expect(d.candidateName).toBe('Jane');
    expect(d.interviewType).toBe('TECHNICAL');
    expect(d.interviewStatus).toBe('SCHEDULED');
    expect(d.allowedDuration).toBe(15);
    expect(d.totalDuration).toBe(0);
    expect(d.integrityScore).toBe(0);
    expect(d.summary).toBe('');
    expect(d.recommendation).toBe('PENDING');
    expect(d.overallScore).toBeNull();
    expect(d.startedAt).toBeNull();
    expect(d.questionsAnswers).toHaveLength(0);
    expect(d.transcriptMetadata!.language).toBe('en-US');
    expect(d.createdBy).toBe('SYSTEM');
  });

  it('requires candidate, job and deadline fields', () => {
    const err = new Interview({}).validateSync()!;
    expect(Object.keys(err.errors).sort()).toEqual(
      ['candidateEmail', 'candidateId', 'candidateName', 'deadline', 'jobId', 'jobTitle']
    );
  });

  it('organizationId is optional', () => {
    const { organizationId, ...rest } = base();
    expect(new Interview(rest).validateSync()).toBeUndefined();
  });

  it('rejects invalid enums and out-of-range scores', () => {
    const d = new Interview({
      ...base(),
      interviewType: 'NOPE',
      interviewStatus: 'NOPE',
      recommendation: 'MAYBE',
      overallScore: 11,
      transcriptMetadata: { integrity: 2 },
    });
    const keys = Object.keys(d.validateSync()!.errors);
    expect(keys).toEqual(expect.arrayContaining([
      'interviewType', 'interviewStatus', 'recommendation', 'overallScore', 'transcriptMetadata.integrity',
    ]));
  });

  it('validates embedded questions (question required, score 0..10)', () => {
    const d = new Interview({ ...base(), questionsAnswers: [{ candidateAnswer: 'x', score: 12 }] });
    const keys = Object.keys(d.validateSync()!.errors);
    expect(keys).toEqual(expect.arrayContaining(['questionsAnswers.0.question', 'questionsAnswers.0.score']));
  });

  it('question subdocs default duration/answeredAt/score and get an _id', () => {
    const d = new Interview({ ...base(), questionsAnswers: [{ question: 'Q?' }] });
    const qa = d.questionsAnswers[0] as any;
    expect(qa._id).toBeDefined();
    expect(qa.duration).toBe(0);
    expect(qa.score).toBeNull();
    expect(qa.answeredAt).toBeInstanceOf(Date);
  });

  it('QAwithReference model validates a question', () => {
    expect(new QAwithReference({}).validateSync()!.errors.question).toBeDefined();
    expect(new QAwithReference({ question: 'ok' }).validateSync()).toBeUndefined();
  });

  describe('virtuals', () => {
    it('totalQuestions counts questions', () => {
      const d = new Interview({ ...base(), questionsAnswers: [{ question: 'a' }, { question: 'b' }] });
      expect((d as any).totalQuestions).toBe(2);
      expect(d.toJSON().totalQuestions).toBe(2);
    });

    it('calculatedDuration is seconds between start and completion, else 0', () => {
      const d: any = new Interview(base());
      expect(d.calculatedDuration).toBe(0);
      d.startedAt = new Date('2030-01-01T00:00:00Z');
      expect(d.calculatedDuration).toBe(0);
      d.completedAt = new Date('2030-01-01T00:02:30.900Z');
      expect(d.calculatedDuration).toBe(150);
    });
  });

  describe('instance methods', () => {
    it('addQuestionAnswer pushes and saves', async () => {
      const d: any = new Interview(base());
      const save = vi.spyOn(d, 'save').mockResolvedValue(d);
      const r = await d.addQuestionAnswer('Q', 'A', 'REF');
      expect(r).toBe(d);
      expect(save).toHaveBeenCalledOnce();
      expect(d.questionsAnswers).toHaveLength(1);
      expect(d.questionsAnswers[0]).toMatchObject({ question: 'Q', candidateAnswer: 'A', referenceAnswer: 'REF' });
    });

    it('updateStatus(IN_PROGRESS) sets startedAt once', async () => {
      const d: any = new Interview(base());
      vi.spyOn(d, 'save').mockResolvedValue(d);
      await d.updateStatus('IN_PROGRESS');
      expect(d.interviewStatus).toBe('IN_PROGRESS');
      expect(d.startedAt).toBeInstanceOf(Date);
      const first = d.startedAt;
      await d.updateStatus('IN_PROGRESS');
      expect(d.startedAt).toBe(first);
    });

    it('updateStatus(COMPLETED) sets completedAt and totalDuration', async () => {
      const d: any = new Interview(base());
      vi.spyOn(d, 'save').mockResolvedValue(d);
      d.startedAt = new Date(Date.now() - 90_000);
      await d.updateStatus('COMPLETED');
      expect(d.completedAt).toBeInstanceOf(Date);
      expect(d.totalDuration).toBeGreaterThanOrEqual(89);
      expect(d.totalDuration).toBeLessThanOrEqual(91);
    });

    it('updateStatus(COMPLETED) does not overwrite an existing completedAt', async () => {
      const d: any = new Interview(base());
      vi.spyOn(d, 'save').mockResolvedValue(d);
      const done = new Date('2030-01-01');
      d.completedAt = done;
      await d.updateStatus('COMPLETED');
      expect(d.completedAt).toBe(done);
      expect(d.totalDuration).toBe(0);
    });

    it('updateStatus for other statuses only changes status', async () => {
      const d: any = new Interview(base());
      vi.spyOn(d, 'save').mockResolvedValue(d);
      await d.updateStatus('CANCELLED');
      expect(d.interviewStatus).toBe('CANCELLED');
      expect(d.startedAt).toBeNull();
      expect(d.completedAt).toBeNull();
    });
  });

  describe('statics', () => {
    const chain = (rows: any[]) => {
      const sort = vi.fn().mockResolvedValue(rows);
      return { sort };
    };

    it('findByCandidate', async () => {
      const c = chain([1]);
      const find = vi.spyOn(Interview, 'find').mockReturnValue(c as any);
      const id = new mongoose.Types.ObjectId(VALID_ID);
      expect(await Interview.findByCandidate(id)).toEqual([1]);
      expect(find).toHaveBeenCalledWith({ candidateId: id });
      expect(c.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it('findByJob', async () => {
      const c = chain([2]);
      const find = vi.spyOn(Interview, 'find').mockReturnValue(c as any);
      const id = new mongoose.Types.ObjectId(VALID_ID_2);
      expect(await Interview.findByJob(id)).toEqual([2]);
      expect(find).toHaveBeenCalledWith({ jobId: id });
      expect(c.sort).toHaveBeenCalledWith({ scheduledAt: -1 });
    });

    it('findByStatus', async () => {
      const c = chain([3]);
      const find = vi.spyOn(Interview, 'find').mockReturnValue(c as any);
      expect(await Interview.findByStatus('COMPLETED')).toEqual([3]);
      expect(find).toHaveBeenCalledWith({ interviewStatus: 'COMPLETED' });
      expect(c.sort).toHaveBeenCalledWith({ scheduledAt: -1 });
    });
  });
});
