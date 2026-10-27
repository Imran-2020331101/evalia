import { describe, it, expect } from 'vitest';
import parseResumePrompt from '../../../src/prompts/parseResumePrompt';

describe('parseResumePrompt', () => {
  it('embeds the resume text', () => {
    const p = parseResumePrompt('John Doe, Engineer');
    expect(p).toContain('John Doe, Engineer');
    expect(p).toContain('Resume Text:');
  });
  it('lists all industries and JSON sections', () => {
    const p = parseResumePrompt('x');
    for (const s of ['STEM & Technical', 'Business, Finance & Administration', 'Creative, Media & Communication',
      'Education, Social & Legal Services', 'Skilled Trades, Labor & Services', 'Others',
      '"skills"', '"education"', '"experience"', '"certifications"', '"projects"', '"awards"', '"keywords"']) {
      expect(p).toContain(s);
    }
  });
  it('handles empty input', () => {
    expect(parseResumePrompt('')).toContain('Resume Text:\n"""\n\n"""');
  });
});
