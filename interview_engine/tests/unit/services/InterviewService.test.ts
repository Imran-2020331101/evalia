import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockQuery, VALID_ID, VALID_ID_2, VALID_ID_3, documentNotFoundError } from '../../helpers/testDb';

const h = vi.hoisted(() => ({
  interviewCtor: vi.fn(),
  save: vi.fn(),
  evalSave: vi.fn(),
  evalCtor: vi.fn(),
  sendToLLM: vi.fn(),
  evaluateInterview: vi.fn(),
  loggerInfo: vi.fn(),
}));

vi.mock('../../../src/models/InterviewSchema', () => {
  const Interview: any = function (this: any, data: any) {
    h.interviewCtor(data);
    Object.assign(this, data);
    this.save = h.save;
  };
  Interview.findByCandidate = vi.fn();
  Interview.findById = vi.fn();
  Interview.findOne = vi.fn();
  Interview.updateMany = vi.fn();
  return {
    Interview,
    InterviewStatus: { COMPLETED: 'COMPLETED' },
  };
});
vi.mock('../../../src/models/InterviewEvaluationSchema', () => {
  const InterviewEvaluation: any = function (this: any, data: any) {
    h.evalCtor(data);
    this.save = h.evalSave;
  };
  InterviewEvaluation.findOne = vi.fn();
  return { InterviewEvaluation };
});
vi.mock('../../../src/config/OpenRouter', () => ({ default: h.sendToLLM }));
vi.mock('../../../src/services/EvaluateInterview', () => ({ evaluateInterview: h.evaluateInterview }));
vi.mock('../../../src/utils/logger', () => ({ default: { info: h.loggerInfo } }));

import { interviewService } from '../../../src/services/InterviewService';
import { Interview } from '../../../src/models/InterviewSchema';
import { InterviewEvaluation } from '../../../src/models/InterviewEvaluationSchema';
import { scheduleBody, transcript } from '../../fixtures/interview';

const I = Interview as any;
const E = InterviewEvaluation as any;

describe('InterviewService', () => {
  describe('createNewInterview', () => {
    const saved = {
      _id: { toString: () => 'int-1' },
      candidateId: { toString: () => VALID_ID },
      candidateEmail: 'jane@example.com',
      jobId: { toString: () => VALID_ID_2 },
      jobTitle: 'Backend Engineer',
      organizationId: { toString: () => VALID_ID_3 },
      deadline: new Date('2030-01-01'),
      totalQuestions: 2,
      interviewStatus: 'SCHEDULED',
    };

    it('builds the document from the request and returns a flat summary', async () => {
      h.save.mockResolvedValue(saved);
      const r = await interviewService.createNewInterview(scheduleBody as any);

      expect(h.interviewCtor).toHaveBeenCalledWith({
        candidateId: VALID_ID,
        candidateEmail: 'Jane@Example.com',
        candidateName: 'Jane Doe',
        jobId: VALID_ID_2,
        jobTitle: 'Backend Engineer',
        organizationId: VALID_ID_3,
        deadline: scheduleBody.deadline,
        interviewStatus: 'SCHEDULED',
        questionsAnswers: [
          { question: 'What is REST?', candidateAnswer: null, referenceAnswer: 'An architectural style' },
          { question: 'What is an index?', candidateAnswer: null, referenceAnswer: undefined },
        ],
      });
      expect(r).toEqual({
        interviewId: 'int-1',
        candidateId: VALID_ID,
        candidateEmail: 'jane@example.com',
        jobId: VALID_ID_2,
        jobTitle: 'Backend Engineer',
        organizationId: VALID_ID_3,
        deadline: saved.deadline,
        totalQuestions: 2,
        status: 'SCHEDULED',
      });
    });

    it('creates an interview with no questions when interviewQA is absent', async () => {
      h.save.mockResolvedValue(saved);
      const body = { ...scheduleBody, job: { id: 'j', title: 't' } };
      await interviewService.createNewInterview(body as any);
      expect(h.interviewCtor.mock.calls[0][0].questionsAnswers).toEqual([]);
    });

    it('propagates save errors', async () => {
      h.save.mockRejectedValue(new Error('db down'));
      await expect(interviewService.createNewInterview(scheduleBody as any)).rejects.toThrow('db down');
    });
  });

  describe('queries', () => {
    it('getAllInterviewsOfAUser casts the id to an ObjectId', async () => {
      I.findByCandidate.mockResolvedValue(['x']);
      expect(await interviewService.getAllInterviewsOfAUser(VALID_ID)).toEqual(['x']);
      const arg = I.findByCandidate.mock.calls[0][0];
      expect(arg.toString()).toBe(VALID_ID);
      expect(arg.constructor.name).toBe('ObjectId');
    });

    it('getAllInterviewsOfAUser rejects a malformed id', async () => {
      await expect(interviewService.getAllInterviewsOfAUser('nope')).rejects.toThrow();
    });

    it('getInterviewById uses orFail', async () => {
      const q = mockQuery({ id: 1 });
      I.findById.mockReturnValue(q);
      expect(await interviewService.getInterviewById('i1')).toEqual({ id: 1 });
      expect(I.findById).toHaveBeenCalledWith('i1');
      expect(q.orFail).toHaveBeenCalled();
    });

    it('getInterviewById surfaces DocumentNotFoundError', async () => {
      I.findById.mockReturnValue(mockQuery(null, { reject: documentNotFoundError() }));
      await expect(interviewService.getInterviewById('i1')).rejects.toMatchObject({ name: 'DocumentNotFoundError' });
    });

    it('getInterviewByJobAndCandidate filters by both ids (may be null)', async () => {
      I.findOne.mockResolvedValue(null);
      expect(await interviewService.getInterviewByJobAndCandidate('j', 'c')).toBeNull();
      expect(I.findOne).toHaveBeenCalledWith({ candidateId: 'c', jobId: 'j' });
    });

    it('fetchSummaryById projects only the summary', async () => {
      I.findById.mockResolvedValue({ summary: 's' });
      expect(await interviewService.fetchSummaryById('i1')).toEqual({ summary: 's' });
      expect(I.findById).toHaveBeenCalledWith('i1', 'summary');
    });

    it('markInterviewAsCompleted sets COMPLETED status', async () => {
      I.updateMany.mockResolvedValue({ modifiedCount: 1 });
      expect(await interviewService.markInterviewAsCompleted('i1')).toEqual({ modifiedCount: 1 });
      expect(I.updateMany).toHaveBeenCalledWith({ _id: 'i1' }, { $set: { interviewStatus: 'COMPLETED' } });
    });

    it('fetchEvaluationByInterviewId uses orFail', async () => {
      const q = mockQuery({ overallScore: 0.5 });
      E.findOne.mockReturnValue(q);
      expect(await interviewService.fetchEvaluationByInterviewId('i1')).toEqual({ overallScore: 0.5 });
      expect(E.findOne).toHaveBeenCalledWith({ interviewId: 'i1' });
    });

    it('fetchEvaluationByInterviewId propagates not-found', async () => {
      E.findOne.mockReturnValue(mockQuery(null, { reject: documentNotFoundError() }));
      await expect(interviewService.fetchEvaluationByInterviewId('i1')).rejects.toThrow('No document found');
    });
  });

  describe('LLM helpers', () => {
    it('generateSummaryUsingLLM sends the prompt and returns the trimmed summary', async () => {
      h.sendToLLM.mockResolvedValue('  A fine candidate.  ');
      const s = await interviewService.generateSummaryUsingLLM(transcript);
      expect(s).toBe('A fine candidate.');
      expect(h.sendToLLM.mock.calls[0][0]).toContain('What is REST?');
      expect(h.loggerInfo).toHaveBeenCalledWith('Generated Interview Summary : ', { summary: 'A fine candidate.' });
    });

    it('generateSummaryUsingLLM propagates LLM failures', async () => {
      h.sendToLLM.mockRejectedValue(new Error('llm'));
      await expect(interviewService.generateSummaryUsingLLM(transcript)).rejects.toThrow('llm');
    });

    it('mapTranscriptToQA sends only question text and parses the JSON reply', async () => {
      const reply = [{ question: 'Q1', candidateAnswer: 'A1' }];
      h.sendToLLM.mockResolvedValue(JSON.stringify(reply));
      const r = await interviewService.mapTranscriptToQA(transcript, [
        { question: 'Q1', candidateAnswer: null, referenceAnswer: 'secret-ref' },
      ]);
      expect(r).toEqual(reply);
      const prompt: string = h.sendToLLM.mock.calls[0][0];
      expect(prompt).toContain('"question": "Q1"');
      expect(prompt).not.toContain('secret-ref'); // reference answers must not leak to the LLM
    });

    it('mapTranscriptToQA throws on non-JSON LLM output', async () => {
      h.sendToLLM.mockResolvedValue('Sorry, I cannot');
      await expect(interviewService.mapTranscriptToQA(transcript, [])).rejects.toThrow(SyntaxError);
    });
  });

  describe('generateInterviewEvaluation', () => {
    beforeEach(() => h.evalSave.mockResolvedValue({ saved: true }));

    it('evaluates, normalises per-question fields and saves', async () => {
      h.evaluateInterview.mockResolvedValue({
        overallScore: 0.8,
        perQuestion: [
          { questionIndex: 0, responseLatency: 3, notes: ['n'] },
          { questionIndex: 1, responseLatency: undefined, notes: undefined },
        ],
      });
      const qa = [{ question: 'Q', candidateAnswer: 'A' }];
      const r = await interviewService.generateInterviewEvaluation(qa, 0.9, 'int-1');

      expect(h.evaluateInterview).toHaveBeenCalledWith(qa, 0.9);
      expect(h.evalCtor).toHaveBeenCalledWith({
        overallScore: 0.8,
        interviewId: 'int-1',
        perQuestion: [
          { questionIndex: 0, responseLatency: 3, notes: ['n'] },
          { questionIndex: 1, responseLatency: 0, notes: [] },
        ],
      });
      expect(r).toEqual({ saved: true });
    });

    it('propagates evaluation errors without saving', async () => {
      h.evaluateInterview.mockRejectedValue(new Error('eval'));
      await expect(interviewService.generateInterviewEvaluation([], 1, 'i')).rejects.toThrow('eval');
      expect(h.evalSave).not.toHaveBeenCalled();
    });
  });
});
