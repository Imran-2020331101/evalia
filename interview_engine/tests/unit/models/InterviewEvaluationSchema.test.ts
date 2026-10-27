import { describe, it, expect } from 'vitest';
import { InterviewEvaluation } from '../../../src/models/InterviewEvaluationSchema';

const pq = {
  questionIndex: 0, contentScore: 0.5, communicationScore: 0.9, finalScore: 0.6,
  similarity: 0.7, keywordsMatched: ['a'], keywordCoverage: 0.5, responseLatency: 0, fillerRate: 0.01,
};
const valid = () => ({
  interviewId: 'abc', overallScore: 0.8, contentAggregate: 0.7, commAggregate: 0.9,
  integrityAggregate: 1, responsivenessAggregate: 1, perQuestion: [pq], flags: ['x'], decision: 'advance',
});

describe('InterviewEvaluation model', () => {
  it('accepts a complete document', () => {
    const d = new InterviewEvaluation(valid());
    expect(d.validateSync()).toBeUndefined();
    expect(d.perQuestion).toHaveLength(1);
    expect((d.perQuestion[0] as any)._id).toBeUndefined(); // subdocs use {_id:false}
  });

  it('requires the aggregate fields and interviewId', () => {
    const keys = Object.keys(new InterviewEvaluation({}).validateSync()!.errors).sort();
    expect(keys).toEqual([
      'commAggregate', 'contentAggregate', 'integrityAggregate', 'interviewId',
      'overallScore', 'responsivenessAggregate',
    ]);
  });

  it('requires per-question numeric fields', () => {
    const d = new InterviewEvaluation({ ...valid(), perQuestion: [{}] });
    const keys = Object.keys(d.validateSync()!.errors);
    expect(keys).toEqual(expect.arrayContaining([
      'perQuestion.0.questionIndex', 'perQuestion.0.contentScore', 'perQuestion.0.fillerRate',
    ]));
  });

  it.each(['advance', 'maybe', 'reject'])('allows decision %s', (decision) => {
    expect(new InterviewEvaluation({ ...valid(), decision }).validateSync()).toBeUndefined();
  });

  it('rejects an unknown decision', () => {
    expect(new InterviewEvaluation({ ...valid(), decision: 'hire' }).validateSync()!.errors.decision).toBeDefined();
  });

  it('decision is optional', () => {
    const { decision, ...rest } = valid();
    expect(new InterviewEvaluation(rest).validateSync()).toBeUndefined();
  });

  it('silently drops the "notes" field that the service adds (not in schema)', () => {
    const d = new InterviewEvaluation({ ...valid(), perQuestion: [{ ...pq, notes: ['n'] }] });
    expect((d.perQuestion[0] as any).notes).toBeUndefined();
  });
});
