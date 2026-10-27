import { describe, it, expect } from 'vitest';
import { generateInterviewSummaryPrompt } from '../../../src/prompts/InterviewSummary.prompt';

describe('generateInterviewSummaryPrompt', () => {
  const transcript = [
    { role: 'assistant' as const, text: 'Tell me about REST' },
    { role: 'user' as const, text: 'It is "stateless"' },
  ];

  it('embeds the transcript as pretty-printed JSON', () => {
    const p = generateInterviewSummaryPrompt(transcript);
    expect(p).toContain(JSON.stringify(transcript, null, 2));
  });

  it('contains the evaluator instructions and is trimmed', () => {
    const p = generateInterviewSummaryPrompt(transcript);
    expect(p).toContain('expert interviewer and evaluator');
    expect(p).toContain('single, well-structured paragraph');
    expect(p).toContain('3-5 sentences');
    expect(p).toBe(p.trim());
  });

  it('handles an empty transcript', () => {
    expect(generateInterviewSummaryPrompt([])).toContain('[]');
  });
});
