import { describe, it, expect, vi } from 'vitest';

const h = vi.hoisted(() => ({ create: vi.fn(), opts: undefined as any }));
vi.mock('openai', () => ({
  default: class {
    chat = { completions: { create: h.create } };
    constructor(opts: any) { h.opts = opts; }
  },
}));

import upskillBot, { processLLMResponse } from '../../../src/config/OpenRouter';

describe('processLLMResponse', () => {
  it('strips ```json fences and trims', () => {
    expect(processLLMResponse('```json\n{"a":1}\n```')).toBe('{"a":1}');
  });
  it('strips bare ``` fences', () => {
    expect(processLLMResponse('```\nhello\n```')).toBe('hello');
  });
  it('returns plain strings trimmed', () => {
    expect(processLLMResponse('  hi  ')).toBe('hi');
  });
  it('joins multi-part content (strings and {text})', () => {
    expect(processLLMResponse(['a', { text: 'b' }, { nope: 1 }, null, ''])).toBe('a\nb');
  });
  it.each([undefined, null, 42, {}])('returns empty string for non-string %s', (v) => {
    expect(processLLMResponse(v)).toBe('');
  });
});

describe('upskillBot', () => {
  

  it('constructs the client against OpenRouter', () => {
    expect(h.opts).toMatchObject({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: 'test-openrouter-key',
    });
    expect(h.opts.defaultHeaders['X-Title']).toBe('evalia upskill engine');
  });

  it('sends the prompt and returns the cleaned completion', async () => {
    h.create.mockResolvedValue({ choices: [{ message: { content: '```json\n{"ok":true}\n```' } }] });
    await expect(upskillBot('hello')).resolves.toBe('{"ok":true}');
    expect(h.create).toHaveBeenCalledWith(expect.objectContaining({
      messages: [{ role: 'user', content: 'hello' }],
    }));
  });

  it('returns empty string when no choices come back', async () => {
    h.create.mockResolvedValue({ choices: [] });
    await expect(upskillBot('x')).resolves.toBe('');
  });

  it('propagates API errors', async () => {
    h.create.mockRejectedValue(new Error('429'));
    await expect(upskillBot('x')).rejects.toThrow('429');
  });
});
