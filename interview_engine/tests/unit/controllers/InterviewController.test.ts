import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockQuery, VALID_ID, VALID_ID_2, documentNotFoundError } from '../../helpers/testDb';
import { flushPromises, mockRes } from '../../helpers/testApp';
import { scheduleBody, createdInterview, transcript } from '../../fixtures/interview';

const h = vi.hoisted(() => ({
  svc: {
    createNewInterview: vi.fn(),
    mapTranscriptToQA: vi.fn(),
    generateSummaryUsingLLM: vi.fn(),
    generateInterviewEvaluation: vi.fn(),
    getAllInterviewsOfAUser: vi.fn(),
    getInterviewById: vi.fn(),
    getInterviewByJobAndCandidate: vi.fn(),
    fetchSummaryById: vi.fn(),
    fetchEvaluationByInterviewId: vi.fn(),
  },
  notify: vi.fn(),
  findById: vi.fn(),
  findByIdAndUpdate: vi.fn(),
}));

vi.mock('../../../src/services/InterviewService', () => ({ interviewService: h.svc }));
vi.mock('../../../src/utils/notify', () => ({ sendNotification: h.notify }));
vi.mock('../../../src/models/InterviewSchema', () => ({
  Interview: { findById: h.findById, findByIdAndUpdate: h.findByIdAndUpdate },
  QAwithReference: {},
}));

import { interviewController as c, InterviewController } from '../../../src/controllers/InterviewController';
import { BadRequestError } from '../../../src/errors';

async function call(handler: any, req: any) {
  const res = mockRes();
  const next = vi.fn();
  handler({ params: {}, body: {}, ...req }, res, next);
  await flushPromises();
  return { res, next };
}

describe('InterviewController', () => {
  it('exports a singleton instance', () => {
    expect(c).toBeInstanceOf(InterviewController);
  });

  describe('scheduleInterview', () => {
    it('creates the interview, sends a notification and responds 201', async () => {
      h.svc.createNewInterview.mockResolvedValue(createdInterview);
      const { res, next } = await call(c.scheduleInterview, { body: scheduleBody });

      expect(next).not.toHaveBeenCalled();
      expect(h.svc.createNewInterview).toHaveBeenCalledWith(expect.objectContaining({ deadline: scheduleBody.deadline }));
      expect(h.notify).toHaveBeenCalledWith(
        {
          type: 'interview.scheduled',
          interviewId: createdInterview.interviewId,
          candidateId: createdInterview.candidateId,
          candidateEmail: 'jane@example.com',
          jobId: createdInterview.jobId,
          jobTitle: 'Backend Engineer',
          organizationId: createdInterview.organizationId,
          deadline: createdInterview.deadline,
          totalQuestions: 2,
          status: 'SCHEDULED',
        },
        'notifications'
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true, message: 'Interview scheduled successfully', data: createdInterview,
      });
    });

    it('rejects an invalid body with a BadRequestError listing the issues', async () => {
      const body = { ...scheduleBody, candidate: { id: 1 }, deadline: undefined };
      const { res, next } = await call(c.scheduleInterview, { body });
      expect(res.status).not.toHaveBeenCalled();
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(BadRequestError);
      expect(err.message).toMatch(/^Validation failed: /);
      expect(h.svc.createNewInterview).not.toHaveBeenCalled();
    });

    // BUG (source): `console.log(req.body.job.interviewQA[0])` runs before validation, so a body
    // without `job` throws a TypeError (-> 500) instead of a 400 validation error.
    it('crashes with a TypeError (not a 400) when job is missing from the body', async () => {
      const { next } = await call(c.scheduleInterview, { body: { candidate: {} } });
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(TypeError);
      expect(err).not.toBeInstanceOf(BadRequestError);
    });

    it('forwards service errors to next()', async () => {
      const boom = new Error('db');
      h.svc.createNewInterview.mockRejectedValue(boom);
      const { next } = await call(c.scheduleInterview, { body: scheduleBody });
      expect(next).toHaveBeenCalledWith(boom);
      expect(h.notify).not.toHaveBeenCalled();
    });
  });

  describe('id validation (shared by id-based handlers)', () => {
    const cases: Array<[string, any]> = [
      ['getInterviewDetails', c.getInterviewDetails],
      ['getSummaryOfAnInterview', c.getSummaryOfAnInterview],
      ['getEvaluationByInterviewId', c.getEvaluationByInterviewId],
      ['addTranscriptToInterview', c.addTranscriptToInterview],
    ];
    it.each(cases)('%s rejects empty/"null"/"undefined" ids', async (_n, handler) => {
      for (const id of [undefined, '', 'null', 'undefined']) {
        const { next } = await call(handler, { params: { interviewId: id } });
        const err = next.mock.calls[0][0];
        expect(err).toBeInstanceOf(BadRequestError);
        expect(err.message).toBe('Valid interview ID is required');
      }
    });
    it.each(cases)('%s rejects malformed ObjectIds', async (_n, handler) => {
      const { next } = await call(handler, { params: { interviewId: 'abc123' } });
      expect(next.mock.calls[0][0].message).toBe('Invalid interview ID format');
    });
  });

  describe('getAllInterviewsOfAUser', () => {
    it('returns interviews', async () => {
      h.svc.getAllInterviewsOfAUser.mockResolvedValue([{ id: 1 }]);
      const { res } = await call(c.getAllInterviewsOfAUser, { params: { candidateId: VALID_ID } });
      expect(h.svc.getAllInterviewsOfAUser).toHaveBeenCalledWith(VALID_ID);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Interviews retrieved successfully', data: [{ id: 1 }] });
    });

    it.each([undefined, '', 'null', 'undefined'])('rejects candidateId %j', async (id) => {
      const { next } = await call(c.getAllInterviewsOfAUser, { params: { candidateId: id } });
      expect(next.mock.calls[0][0].message).toBe('Valid candidate ID is required');
    });

    it('rejects malformed candidateId', async () => {
      const { next } = await call(c.getAllInterviewsOfAUser, { params: { candidateId: 'zzz' } });
      expect(next.mock.calls[0][0].message).toBe('Invalid candidate ID format');
    });
  });

  describe('getInterviewDetails', () => {
    it('returns the interview', async () => {
      h.svc.getInterviewById.mockResolvedValue({ a: 1 });
      const { res } = await call(c.getInterviewDetails, { params: { interviewId: VALID_ID } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { a: 1 } });
    });
    it('forwards not-found errors', async () => {
      const e = documentNotFoundError();
      h.svc.getInterviewById.mockRejectedValue(e);
      const { next } = await call(c.getInterviewDetails, { params: { interviewId: VALID_ID } });
      expect(next).toHaveBeenCalledWith(e);
    });
  });

  describe('getInterviewByJobAndCandidate', () => {
    it('returns the interview (including null)', async () => {
      h.svc.getInterviewByJobAndCandidate.mockResolvedValue(null);
      const { res } = await call(c.getInterviewByJobAndCandidate, { params: { jobId: VALID_ID, candidateId: VALID_ID_2 } });
      expect(h.svc.getInterviewByJobAndCandidate).toHaveBeenCalledWith(VALID_ID, VALID_ID_2);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: null });
    });
    it('validates jobId first, then candidateId', async () => {
      let r = await call(c.getInterviewByJobAndCandidate, { params: { jobId: 'bad', candidateId: VALID_ID } });
      expect(r.next.mock.calls[0][0]).toBeInstanceOf(BadRequestError);
      r = await call(c.getInterviewByJobAndCandidate, { params: { jobId: VALID_ID, candidateId: 'bad' } });
      expect(r.next.mock.calls[0][0].message).toBe('Invalid interview ID format');
      expect(h.svc.getInterviewByJobAndCandidate).not.toHaveBeenCalled();
    });
  });

  describe('getSummaryOfAnInterview', () => {
    // BUG (source): the response key is "date" instead of "data".
    it('responds with the summary under the (misspelled) "date" key', async () => {
      h.svc.fetchSummaryById.mockResolvedValue({ summary: 's' });
      const { res } = await call(c.getSummaryOfAnInterview, { params: { interviewId: VALID_ID } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, date: { summary: 's' } });
    });
  });

  describe('getEvaluationByInterviewId', () => {
    it('returns the evaluation', async () => {
      h.svc.fetchEvaluationByInterviewId.mockResolvedValue({ overallScore: 1 });
      const { res } = await call(c.getEvaluationByInterviewId, { params: { interviewId: VALID_ID } });
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { overallScore: 1 } });
    });
    it('forwards not-found', async () => {
      const e = documentNotFoundError();
      h.svc.fetchEvaluationByInterviewId.mockRejectedValue(e);
      const { next } = await call(c.getEvaluationByInterviewId, { params: { interviewId: VALID_ID } });
      expect(next).toHaveBeenCalledWith(e);
    });
  });

  describe('addTranscriptToInterview', () => {
    const answeredAt = new Date('2020-01-01');
    const interview = {
      integrityScore: 0.9,
      questionsAnswers: [
        { question: 'Q1', candidateAnswer: 'old1', referenceAnswer: 'r1', score: 5, feedback: 'f', duration: 7, answeredAt },
        { question: 'Q2', candidateAnswer: null, referenceAnswer: 'r2', answeredAt },
        { question: 'Q3', candidateAnswer: 'keep', referenceAnswer: 'r3', answeredAt },
      ],
    };

    beforeEach(() => {
      h.findById.mockReturnValue(mockQuery(interview));
      h.svc.generateSummaryUsingLLM.mockResolvedValue('SUMMARY');
      h.svc.generateInterviewEvaluation.mockResolvedValue({});
      h.findByIdAndUpdate.mockReturnValue(mockQuery({ updated: true }));
    });

    it('maps transcript answers, stores summary, evaluates and responds 200', async () => {
      h.svc.mapTranscriptToQA.mockResolvedValue([
        { question: 'Q1', candidateAnswer: 'new1' },
        { question: 'Q2', candidateAnswer: '' },       // empty -> keep existing (null)
        // Q3 absent from LLM output -> keep existing
      ]);
      const { res, next } = await call(c.addTranscriptToInterview, { params: { interviewId: VALID_ID }, body: { transcript } });
      expect(next).not.toHaveBeenCalled();

      expect(h.svc.mapTranscriptToQA).toHaveBeenCalledWith(transcript, interview.questionsAnswers);
      expect(h.svc.generateSummaryUsingLLM).toHaveBeenCalledWith(transcript);

      const [id, update, opts] = h.findByIdAndUpdate.mock.calls[0];
      expect(id).toBe(VALID_ID);
      expect(opts).toEqual({ new: true });
      expect(update.summary).toBe('SUMMARY');
      const [q1, q2, q3] = update.questionsAnswers;
      expect(q1).toMatchObject({ question: 'Q1', candidateAnswer: 'new1', referenceAnswer: 'r1', score: 5, feedback: 'f', duration: 7 });
      expect(q1.answeredAt).toBeInstanceOf(Date);
      expect(q1.answeredAt).not.toBe(answeredAt);
      expect(q2.candidateAnswer).toBeNull();
      expect(q2.answeredAt).toBe(answeredAt);
      expect(q3.candidateAnswer).toBe('keep');
      expect(q3.answeredAt).toBe(answeredAt);

      expect(h.svc.generateInterviewEvaluation).toHaveBeenCalledWith(update.questionsAnswers, 0.9, VALID_ID);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { updated: true } });
    });

    it('forwards DocumentNotFoundError when the interview does not exist', async () => {
      const e = documentNotFoundError();
      h.findById.mockReturnValue(mockQuery(null, { reject: e }));
      const { next } = await call(c.addTranscriptToInterview, { params: { interviewId: VALID_ID }, body: { transcript } });
      expect(next).toHaveBeenCalledWith(e);
      expect(h.svc.mapTranscriptToQA).not.toHaveBeenCalled();
    });

    it('forwards LLM mapping failures', async () => {
      const e = new SyntaxError('bad json');
      h.svc.mapTranscriptToQA.mockRejectedValue(e);
      const { next } = await call(c.addTranscriptToInterview, { params: { interviewId: VALID_ID }, body: { transcript } });
      expect(next).toHaveBeenCalledWith(e);
      expect(h.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('forwards update not-found', async () => {
      h.svc.mapTranscriptToQA.mockResolvedValue([]);
      const e = documentNotFoundError();
      h.findByIdAndUpdate.mockReturnValue(mockQuery(null, { reject: e }));
      const { next } = await call(c.addTranscriptToInterview, { params: { interviewId: VALID_ID }, body: { transcript } });
      expect(next).toHaveBeenCalledWith(e);
      expect(h.svc.generateInterviewEvaluation).not.toHaveBeenCalled();
    });
  });
});
