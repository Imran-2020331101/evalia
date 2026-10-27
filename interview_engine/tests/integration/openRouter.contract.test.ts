import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { chatCompletion } from '../mocks/openrouter';

/**
 * Contract test: runs the real `openai` SDK + src/config/OpenRouter against a stubbed global fetch
 * and checks the wire format sent to OpenRouter and how its response shapes are parsed.
 */
const fetchMock = vi.fn();

async function load() {
  vi.resetModules();
  vi.stubGlobal('fetch', fetchMock);
  return await import('../../src/config/OpenRouter');
}
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

describe('OpenRouter contract', () => {
  beforeEach(() => fetchMock.mockReset());
  afterEach(() => vi.unstubAllGlobals());

  it('POSTs a chat completion to OpenRouter with auth + attribution headers', async () => {
    const { sendToLLM } = await load();
    fetchMock.mockResolvedValue(reply(chatCompletion('hello')));
    expect(await sendToLLM('ping')).toBe('hello');

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe('https://openrouter.ai/api/v1/chat/completions');
    expect(init.method).toBe('POST');
    const headers = new Headers(init.headers);
    expect(headers.get('authorization')).toBe('Bearer test-openrouter-key');
    expect(headers.get('x-title')).toBe('evalia interview engine');
    expect(headers.get('http-referer')).toBe('http://localhost:7000');
    expect(JSON.parse(init.body)).toEqual({
      model: 'openai/gpt-4o-mini-2024-07-18',
      messages: [{ role: 'user', content: 'ping' }],
    });
  });

  it('strips markdown fences from JSON answers', async () => {
    const { sendToLLM } = await load();
    fetchMock.mockResolvedValue(reply(chatCompletion('```json\n[{"question":"q","candidateAnswer":null}]\n```')));
    expect(JSON.parse(await sendToLLM('x'))).toEqual([{ question: 'q', candidateAnswer: null }]);
  });

  it('handles null content (e.g. refusals / empty completions) as ""', async () => {
    const { sendToLLM } = await load();
    fetchMock.mockResolvedValue(reply(chatCompletion(null)));
    expect(await sendToLLM('x')).toBe('');
  });

  it('handles multi-part array content', async () => {
    const { sendToLLM } = await load();
    fetchMock.mockResolvedValue(reply(chatCompletion([{ type: 'text', text: 'a' }, { type: 'text', text: 'b' }])));
    expect(await sendToLLM('x')).toBe('a\nb');
  });

  it('rejects on HTTP 401 from OpenRouter', async () => {
    const { sendToLLM } = await load();
    fetchMock.mockImplementation(async () => reply({ error: { message: 'No auth', code: 401 } }, 401));
    await expect(sendToLLM('x')).rejects.toMatchObject({ status: 401 });
  });
});
