import { describe, it, expect } from 'vitest';
import overviewDefault, { overviewPrompt } from '../../../src/prompts/EvaluationPrompt';

describe('overviewPrompt', () => {
  it('embeds resume and job description and the JSON schema keys', () => {
    const p = overviewPrompt('RESUME-TEXT', 'JOB-TEXT');
    expect(p).toContain('RESUME:\nRESUME-TEXT');
    expect(p).toContain('JOB DESCRIPTION:\nJOB-TEXT');
    for (const k of ['matchPercentage', '"fit"', '"strength"', '"weakness"', 'Best Fit', 'Bad Fit']) expect(p).toContain(k);
  });
  it('default export is the same function', () => {
    expect(overviewDefault).toBe(overviewPrompt);
  });
});
