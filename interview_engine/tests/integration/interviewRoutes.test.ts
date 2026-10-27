import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Only true external I/O is mocked: LLM, similarity API, AMQP and the mongoose model methods.
const h = vi.hoisted(() => ({ sendToLLM: vi.fn(), similarity: vi.fn(), notify: vi.fn() }));
vi.mock('../../src/config/OpenRouter', () => ({ default: h.sendToLLM, sendToLLM: h.sendToLLM }));
vi.mock('../../src/config/ApiNinja', () => ({ similarityAPINinjas: h.similarity }));
vi.mock('../../src/utils/notify', () => ({ sendNotification: h.notify }));

import mongoose from 'mongoose';
import { createTestApp } from '../helpers/testApp';
import { mockQuery, documentNotFoundError, VALID_ID, VALID_ID_2, VALID_ID_3 } from '../helpers/testDb';
import { Interview } from '../../src/models/InterviewSchema';
import { InterviewEvaluation } from '../../src/models/InterviewEvaluationSchema';
import { scheduleBody, transcript } from '../fixtures/interview';

const app = createTestApp();
const base = '/api/interview';

import { afterEach } from 'vitest';
afterEach(() => vi.restoreAllMocks());

describe('POST /api/interview', () => {
  it('validates, persists, notifies and returns 201', async () => {
    const save = vi.spyOn(Interview.prototype, 'save').mockImplementation(async function (this: any) { return this; });
    const res = await request(app).post(base).send(scheduleBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      candidateId: VALID_ID,
      candidateEmail: 'jane@example.com', // lowercased by the schema
      jobId: VALID_ID_2,
      organizationId: VALID_ID_3,
      jobTitle: 'Backend Engineer',
      totalQuestions: 2,
      status: 'SCHEDULED',
    });
    expect(res.body.data.interviewId).toMatch(/^[0-9a-f]{24}$/);
    expect(save).toHaveBeenCalledOnce();
    expect(h.notify).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'interview.scheduled', totalQuestions: 2 }),
      'notifications'
    );
  });

  it('400s on an invalid payload', async () => {
    const res = await request(app).post(base).send({ ...scheduleBody, organization: {} });
    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/^Validation failed/);
    expect(h.notify).not.toHaveBeenCalled();
  });

  it('400s with mongoose validation errors raised on save', async () => {
    vi.restoreAllMocks();
    const body = { ...scheduleBody, candidate: { ...scheduleBody.candidate, id: 'not-an-objectid' } };
    const res = await request(app).post(base).send(body);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation error');
  });

  // BUG (source): controller logs req.body.job.interviewQA[0] before validating.
  it('returns 500 (should be 400) when "job" is missing entirely', async () => {
    const res = await request(app).post(base).send({});
    expect(res.status).toBe(500);
  });
});

describe('GET /api/interview/user/:candidateId', () => {
  it('lists interviews of a candidate', async () => {
    const find = vi.spyOn(Interview, 'find').mockReturnValue(mockQuery([{ jobTitle: 'A' }]) as any);
    const res = await request(app).get(`${base}/user/${VALID_ID}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, message: 'Interviews retrieved successfully', data: [{ jobTitle: 'A' }] });
    expect(find).toHaveBeenCalledWith({ candidateId: expect.anything() });
  });

  it('400s on a malformed id', async () => {
    const res = await request(app).get(`${base}/user/123`);
    expect(res.status).toBe(400);
    expect(res.body.msg).toBe('Invalid candidate ID format');
  });

  it('400s on the literal "null"', async () => {
    const res = await request(app).get(`${base}/user/null`);
    expect(res.status).toBe(400);
    expect(res.body.msg).toBe('Valid candidate ID is required');
  });
});

describe('GET /api/interview/:interviewId', () => {
  it('returns the interview', async () => {
    vi.spyOn(Interview, 'findById').mockReturnValue(mockQuery({ jobTitle: 'X' }) as any);
    const res = await request(app).get(`${base}/${VALID_ID}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: { jobTitle: 'X' } });
  });

  it('404s when the interview does not exist', async () => {
    vi.spyOn(Interview, 'findById').mockReturnValue(mockQuery(null, { reject: documentNotFoundError() }) as any);
    const res = await request(app).get(`${base}/${VALID_ID}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Resource not found');
  });

  it('400s on a malformed id', async () => {
    const res = await request(app).get(`${base}/xyz`);
    expect(res.status).toBe(400);
    expect(res.body.msg).toBe('Invalid interview ID format');
  });
});

describe('GET /api/interview/job/:jobId/candidate/:candidateId', () => {
  it('returns the matching interview', async () => {
    const findOne = vi.spyOn(Interview, 'findOne').mockResolvedValue({ id: 1 } as any);
    const res = await request(app).get(`${base}/job/${VALID_ID_2}/candidate/${VALID_ID}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: { id: 1 } });
    expect(findOne).toHaveBeenCalledWith({ candidateId: VALID_ID, jobId: VALID_ID_2 });
  });

  it('400s on malformed ids', async () => {
    expect((await request(app).get(`${base}/job/bad/candidate/${VALID_ID}`)).status).toBe(400);
    expect((await request(app).get(`${base}/job/${VALID_ID}/candidate/bad`)).status).toBe(400);
  });
});

describe('GET /api/interview/:interviewId/summary', () => {
  it('returns the summary', async () => {
    vi.spyOn(Interview, 'findById').mockResolvedValue({ summary: 'great' } as any);
    const res = await request(app).get(`${base}/${VALID_ID}/summary`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, date: { summary: 'great' } }); // "date" typo is in source
  });
});

describe('GET /api/interview/:interviewId/evaluation', () => {
  it('returns the evaluation', async () => {
    vi.spyOn(InterviewEvaluation, 'findOne').mockReturnValue(mockQuery({ overallScore: 0.8 }) as any);
    const res = await request(app).get(`${base}/${VALID_ID}/evaluation`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: { overallScore: 0.8 } });
  });

  it('404s when no evaluation exists', async () => {
    vi.spyOn(InterviewEvaluation, 'findOne').mockReturnValue(mockQuery(null, { reject: documentNotFoundError() }) as any);
    expect((await request(app).get(`${base}/${VALID_ID}/evaluation`)).status).toBe(404);
  });
});

describe('PUT /api/interview/:interviewId/transcript (full pipeline)', () => {
  const interview = {
    integrityScore: 0.8,
    questionsAnswers: [
      { question: 'What is REST?', candidateAnswer: null, referenceAnswer: 'An architectural style' },
      { question: 'What is an index?', candidateAnswer: null, referenceAnswer: undefined },
    ],
  };

  beforeEach(() => {
    vi.spyOn(Interview, 'findById').mockReturnValue(mockQuery(interview) as any);
    vi.spyOn(Interview, 'findByIdAndUpdate').mockImplementation(((_id: any, update: any) =>
      mockQuery({ _id: VALID_ID, ...update })) as any);
    vi.spyOn(InterviewEvaluation.prototype, 'save').mockImplementation(async function (this: any) { return this; });
    h.sendToLLM.mockImplementation(async (prompt: string) =>
      prompt.includes('QA array')
        ? JSON.stringify([
            { question: 'What is REST?', candidateAnswer: 'An architectural style for APIs' },
            { question: 'What is an index?', candidateAnswer: null },
          ])
        : 'Solid candidate.'
    );
    h.similarity.mockResolvedValue(0.9);
  });

  it('maps the transcript, summarises, evaluates and stores the results', async () => {
    const res = await request(app).put(`${base}/${VALID_ID}/transcript`).send({ transcript });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.summary).toBe('Solid candidate.');
    expect(res.body.data.questionsAnswers[0].candidateAnswer).toBe('An architectural style for APIs');
    expect(res.body.data.questionsAnswers[1].candidateAnswer).toBeNull();

    // similarity is only requested for the question with a reference answer
    expect(h.similarity).toHaveBeenCalledTimes(1);
    expect(h.similarity).toHaveBeenCalledWith('An architectural style for APIs', 'An architectural style');

    const evalSave = InterviewEvaluation.prototype.save as any;
    expect(evalSave).toHaveBeenCalledOnce();
    const evalDoc = evalSave.mock.instances[0];
    expect(evalDoc.interviewId).toBe(VALID_ID);
    expect(evalDoc.perQuestion).toHaveLength(2);
    expect(evalDoc.integrityAggregate).toBe(0.8);
  });

  it('400s on an invalid id without calling the LLM', async () => {
    const res = await request(app).put(`${base}/nope/transcript`).send({ transcript });
    expect(res.status).toBe(400);
    expect(h.sendToLLM).not.toHaveBeenCalled();
  });

  it('500s (generic message) when the LLM returns non-JSON for the mapping step', async () => {
    h.sendToLLM.mockResolvedValue('I cannot do that');
    const res = await request(app).put(`${base}/${VALID_ID}/transcript`).send({ transcript });
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Something went wrong!');
  });

  it('404s when the interview does not exist', async () => {
    (Interview.findById as any).mockReturnValue(mockQuery(null, { reject: documentNotFoundError() }));
    const res = await request(app).put(`${base}/${VALID_ID}/transcript`).send({ transcript });
    expect(res.status).toBe(404);
  });
});

// sanity: the real ObjectId validation the routes rely on
describe('ObjectId assumptions', () => {
  it('fixtures are valid ObjectIds', () => {
    for (const id of [VALID_ID, VALID_ID_2, VALID_ID_3]) expect(mongoose.Types.ObjectId.isValid(id)).toBe(true);
  });
});
