import { describe, it, expect } from 'vitest';
import parseJobDescriptionPrompt from '../../../src/prompts/parseJobDescriptionprompt';

describe('parseJobDescriptionPrompt', () => {
  it('embeds the job description', () => {
    expect(parseJobDescriptionPrompt('Senior Go engineer')).toContain('Senior Go engineer');
  });
  it('requests all fields and enumerates industries', () => {
    const p = parseJobDescriptionPrompt('x');
    for (const s of ['industry', 'skills', 'experience', 'projects', 'education',
      'STEM & Technical', 'Business, Finance & Administration', 'Others']) {
      expect(p).toContain(s);
    }
  });
});
