import { describe, it, expect, vi, beforeEach } from 'vitest';

const create = vi.fn();
const ctor = vi.fn();
vi.mock('openai', () => ({
  default: class {
    chat = { completions: { create } };
    constructor(opts: any) { ctor(opts); }
  },
}));

describe('config/OpenRouter (ResumeBot)', () => {
  beforeEach(() => { vi.resetModules(); create.mockReset(); ctor.mockClear(); });

  it('creates an OpenAI client pointed at OpenRouter', async () => {
    await import('../../../src/config/OpenRouter');
    expect(ctor).toHaveBeenCalledWith(expect.objectContaining({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPEN_ROUTER_API_KEY,
      defaultHeaders: expect.objectContaining({ 'X-Title': 'evalia' }),
    }));
  });

  it('returns the completion content', async () => {
    create.mockResolvedValue({ choices: [{ message: { content: 'answer' } }] });
    const ResumeBot = (await import('../../../src/config/OpenRouter')).default;
    await expect(ResumeBot('hi')).resolves.toBe('answer');
    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      model: 'openai/gpt-4o-mini-2024-07-18',
      messages: [{ role: 'user', content: 'hi' }],
      max_tokens: 4000,
      temperature: 0.1,
    }));
  });

  it('returns empty string when content is null', async () => {
    create.mockResolvedValue({ choices: [{ message: { content: null } }] });
    const ResumeBot = (await import('../../../src/config/OpenRouter')).default;
    await expect(ResumeBot('hi')).resolves.toBe('');
  });

  it('propagates API errors', async () => {
    create.mockRejectedValue(new Error('429'));
    const ResumeBot = (await import('../../../src/config/OpenRouter')).default;
    await expect(ResumeBot('hi')).rejects.toThrow('429');
  });
});
