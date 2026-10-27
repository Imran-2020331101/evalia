import { describe, it, expect, vi, beforeEach } from 'vitest';

const h = vi.hoisted(() => ({ create: vi.fn(), ctor: vi.fn() }));
vi.mock('openai', () => ({
  default: class {
    chat = { completions: { create: h.create } };
    constructor(opts: unknown) { h.ctor(opts); }
  },
}));

async function load() {
  vi.resetModules();
  return await import('../../../src/config/OpenRouter');
}

describe('OpenRouter config', () => {
  beforeEach(() => { delete process.env.OPENROUTER_HTTP_REFERER; });

  it('builds the client against OpenRouter with default referer', async () => {
    await load();
    expect(h.ctor).toHaveBeenCalledWith({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: 'test-openrouter-key',
      defaultHeaders: { 'HTTP-Referer': 'http://localhost:7000', 'X-Title': 'evalia interview engine' },
    });
  });

  it('uses OPENROUTER_HTTP_REFERER when set', async () => {
    process.env.OPENROUTER_HTTP_REFERER = 'https://evalia.test';
    await load();
    expect(h.ctor.mock.calls[0][0].defaultHeaders['HTTP-Referer']).toBe('https://evalia.test');
  });

  describe('sendToLLM', () => {
    it('sends a single user message and returns cleaned content', async () => {
      const mod = await load();
      h.create.mockResolvedValue({ choices: [{ message: { content: '```json\n[1,2]\n```' } }] });
      const out = await mod.sendToLLM('hi');
      expect(out).toBe('[1,2]');
      expect(h.create).toHaveBeenCalledWith({
        model: 'openai/gpt-4o-mini-2024-07-18',
        messages: [{ role: 'user', content: 'hi' }],
      });
      expect(mod.default).toBe(mod.sendToLLM);
    });

    it('returns "" when there are no choices', async () => {
      const mod = await load();
      h.create.mockResolvedValue({ choices: [] });
      expect(await mod.sendToLLM('x')).toBe('');
    });

    it('returns "" when choices is missing', async () => {
      const mod = await load();
      h.create.mockResolvedValue({});
      expect(await mod.sendToLLM('x')).toBe('');
    });

    it('propagates API errors', async () => {
      const mod = await load();
      h.create.mockRejectedValue(new Error('rate limited'));
      await expect(mod.sendToLLM('x')).rejects.toThrow('rate limited');
    });
  });

  describe('processLLMResponse', () => {
    let p: (c: any) => string;
    beforeEach(async () => { p = (await load()).processLLMResponse; });

    it('trims plain strings', () => expect(p('  hello \n')).toBe('hello'));
    it('strips ```json fences (case-insensitive)', () => expect(p('```JSON\n{"a":1}\n```')).toBe('{"a":1}'));
    it('strips bare ``` fences', () => expect(p('```\nabc\n```')).toBe('abc'));
    it('joins array parts: strings, {text} objects, and drops empties/nullish', () => {
      expect(p(['a', { text: 'b' }, {}, null, '', { text: '' }])).toBe('a\nb');
    });
    it('returns "" for non-string, non-array content', () => {
      expect(p(undefined)).toBe('');
      expect(p(null)).toBe('');
      expect(p(42)).toBe('');
      expect(p({ text: 'x' })).toBe('');
    });
  });
});
