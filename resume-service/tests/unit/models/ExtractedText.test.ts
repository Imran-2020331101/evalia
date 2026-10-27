import { describe, it, expect } from 'vitest';
import { ExtractedResume } from '../../../src/models/ExtractedText';

describe('ExtractedResume model', () => {
  it('validates with userId and text', () => {
    const d = new ExtractedResume({ userId: 'u', text: 'hello', userEmail: 'a@b.co', metadata: { pages: 1, info: {}, version: '1' } });
    expect(d.validateSync()).toBeUndefined();
  });
  it('requires userId and text', () => {
    const err = new ExtractedResume({}).validateSync();
    expect(err?.errors.userId).toBeDefined();
    expect(err?.errors.text).toBeDefined();
  });
  it('userEmail is optional', () => {
    expect(new ExtractedResume({ userId: 'u', text: 't' }).validateSync()).toBeUndefined();
  });
});
