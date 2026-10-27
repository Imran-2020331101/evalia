/** Builds an OpenRouter/OpenAI-shaped chat completion payload. */
export function chatCompletion(content: unknown) {
  return {
    id: 'gen-test',
    object: 'chat.completion',
    created: 1700000000,
    model: 'openai/gpt-4o-mini-2024-07-18',
    choices: [{ index: 0, finish_reason: 'stop', message: { role: 'assistant', content } }],
    usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
  };
}
