import { describe, it, expect, vi } from 'vitest';

const post = vi.hoisted(() => vi.fn());
vi.mock('axios', () => ({ default: { post } }));

import { similarityAPINinjas } from '../../../src/config/ApiNinja';

describe('similarityAPINinjas', () => {
  it('posts both texts with the API key header and returns the similarity', async () => {
    post.mockResolvedValue({ data: { similarity: 0.77 } });
    const r = await similarityAPINinjas('a', 'b');
    expect(r).toBe(0.77);
    expect(post).toHaveBeenCalledWith(
      'https://api.api-ninjas.com/v1/textsimilarity',
      { text_1: 'a', text_2: 'b' },
      { headers: { 'X-Api-Key': 'test-ninja-key' } }
    );
  });

  it('propagates HTTP failures', async () => {
    post.mockRejectedValue(new Error('429'));
    await expect(similarityAPINinjas('a', 'b')).rejects.toThrow('429');
  });
});
