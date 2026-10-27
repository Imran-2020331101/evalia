import { describe, it, expect } from 'vitest';
import { CompatibilityReviewModel } from '../../../src/models/CompatibilityReview';

const valid = () => ({ jobId: 'j1', candidateEmail: 'a@b.com', matchPercentage: 80, fit: 'Good Fit' });

describe('CompatibilityReview model', () => {
  it('registers under the compatibility_review model name', () => {
    expect(CompatibilityReviewModel.modelName).toBe('compatibility_review');
  });

  it('accepts a valid document and applies defaults', () => {
    const doc = new CompatibilityReviewModel(valid());
    expect(doc.validateSync()).toBeUndefined();
    expect(doc.strengths).toEqual([]);
    expect(doc.weaknesses).toEqual([]);
    expect(doc.reviewedAt).toBeInstanceOf(Date);
  });

  it('requires jobId, candidateEmail, matchPercentage and fit', () => {
    const err = new CompatibilityReviewModel({}).validateSync();
    expect(Object.keys(err!.errors).sort()).toEqual(['candidateEmail', 'fit', 'jobId', 'matchPercentage']);
  });

  it.each(['Best Fit', 'Good Fit', 'Average', 'Bad Fit'])('accepts fit "%s"', (fit) => {
    expect(new CompatibilityReviewModel({ ...valid(), fit }).validateSync()).toBeUndefined();
  });

  it('rejects an unknown fit value', () => {
    const err = new CompatibilityReviewModel({ ...valid(), fit: 'Great' }).validateSync();
    expect(err?.errors.fit).toBeDefined();
  });

  it('rejects a non-numeric matchPercentage', () => {
    const err = new CompatibilityReviewModel({ ...valid(), matchPercentage: 'abc' }).validateSync();
    expect(err?.errors.matchPercentage).toBeDefined();
  });

  it('indexes jobId and candidateEmail', () => {
    const idx = CompatibilityReviewModel.schema.indexes().map(([f]) => Object.keys(f)[0]);
    expect(idx).toEqual(expect.arrayContaining(['jobId', 'candidateEmail']));
  });
});
