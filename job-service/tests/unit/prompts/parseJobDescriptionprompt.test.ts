import { describe, it, expect } from 'vitest';
import parsePrompt from '../../../src/prompts/parseJobDescriptionprompt';

describe('parseJobDescriptionPrompt', () => {
  it('embeds the job description and lists all allowed industries', () => {
    const p = parsePrompt('We need a Go developer');
    expect(p).toContain('We need a Go developer');
    for (const i of [
      'STEM & Technical', 'Business, Finance & Administration', 'Creative, Media & Communication',
      'Education, Social & Legal Services', 'Skilled Trades, Labor & Services', 'Others',
    ]) expect(p).toContain(i);
    for (const f of ['"skills"', '"experience"', '"projects"', '"education"']) expect(p).toContain(f);
  });
});
