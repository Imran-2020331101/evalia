import { describe, it, expect } from 'vitest';
import { generateMappingPrompt } from '../../../src/prompts/transcript.mapper.prompt';

describe('generateMappingPrompt', () => {
  const transcript = [
    { role: 'assistant' as const, text: 'প্রশ্ন ১' },
    { role: 'user' as const, text: 'উত্তর' },
  ];
  const questions = [{ question: 'প্রশ্ন ১' }, { question: 'Q2' }];

  it('embeds transcript and questions as JSON at the end of the prompt', () => {
    const p = generateMappingPrompt(transcript, questions);
    expect(p).toContain(`"transcript": ${JSON.stringify(transcript, null, 2)}`);
    expect(p).toContain(`"questions": ${JSON.stringify(questions, null, 2)}`);
    expect(p.trim().endsWith('}')).toBe(true);
  });

  it('states the strict-JSON output rules', () => {
    const p = generateMappingPrompt(transcript, questions);
    expect(p).toContain('Output **only valid JSON**');
    expect(p).toContain('candidateAnswer');
    expect(p).toContain('Preserve language');
  });

  it('works with empty inputs', () => {
    const p = generateMappingPrompt([], []);
    expect(p).toContain('"transcript": []');
    expect(p).toContain('"questions": []');
  });
});
