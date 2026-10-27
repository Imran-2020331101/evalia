import { describe, it, expect } from 'vitest';
import qDefault, { questionGenerationPrompt } from '../../../src/prompts/QuestionGenerationPromt';

describe('questionGenerationPrompt', () => {
  it('includes all four sections', () => {
    const p = questionGenerationPrompt('DESC', 'RESP', 'REQ', 'SKILLS');
    expect(p).toContain('JOB DESCRIPTION:\nDESC');
    expect(p).toContain('RESPONSIBILITIES:\nRESP');
    expect(p).toContain('REQUIREMENTS:\nREQ');
    expect(p).toContain('SKILLS:\nSKILLS');
    expect(p).toContain('"referenceAnswer"');
  });
  it('stringifies non-string inputs via template interpolation', () => {
    expect(questionGenerationPrompt('d', undefined, ['a', 'b'], { x: 1 })).toContain('RESPONSIBILITIES:\nundefined');
  });
  it('default export is the same function', () => {
    expect(qDefault).toBe(questionGenerationPrompt);
  });
});
