import { describe, it, expect, vi } from 'vitest';

const h = vi.hoisted(() => ({ create: vi.fn(), opts: undefined as any }));
vi.mock('openai', () => ({
  default: class {
    embeddings = { create: h.create };
    constructor(o: any) { h.opts = o; }
  },
}));
vi.mock('../../../src/config/logger', () => ({ default: { error: vi.fn(), info: vi.fn() }, logger: {} }));

import OpenAIServiceDefault, { OpenAIService, openAIService } from '../../../src/services/OpenAIService';
import logger from '../../../src/config/logger';

const emb = (v: number[]) => ({ data: [{ embedding: v }] });

describe('OpenAIService', () => {
  it('exports class (default+named) and a singleton using OPENAI_API_KEY', () => {
    expect(OpenAIServiceDefault).toBe(OpenAIService);
    expect(openAIService).toBeInstanceOf(OpenAIService);
    expect(h.opts).toEqual({ apiKey: 'test-openai-key' });
  });

  describe('createEmbedding', () => {
    it('calls the embeddings API with trimmed text and returns the vector', async () => {
      h.create.mockResolvedValue(emb([0.1, 0.2]));
      await expect(new OpenAIService().createEmbedding('  hi  ')).resolves.toEqual([0.1, 0.2]);
      expect(h.create).toHaveBeenCalledWith({ model: 'text-embedding-3-small', input: 'hi', encoding_format: 'float' });
    });

    it.each(['', '   ', undefined as any])('rejects empty input %j without calling the API', async (t) => {
      await expect(new OpenAIService().createEmbedding(t)).rejects.toThrow('Text input cannot be empty');
      expect(h.create).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalled();
    });

    it('logs and rethrows API failures', async () => {
      h.create.mockRejectedValue(new Error('api down'));
      await expect(new OpenAIService().createEmbedding('x')).rejects.toThrow('api down');
      expect(logger.error).toHaveBeenCalledWith('Error creating embedding:', expect.any(Error));
    });
  });

  describe('createJobEmbedding', () => {
    it('embeds only the non-empty sections, in order', async () => {
      h.create.mockImplementation(async ({ input }: any) => emb([input.length]));
      const res = await new OpenAIService().createJobEmbedding('ts', '', 'proj1', '   ');
      expect(res).toEqual([
        { section: 'skills', embedding: [2] },
        { section: 'projects', embedding: [5] },
      ]);
      expect(h.create).toHaveBeenCalledTimes(2);
    });

    it('returns [] when every section is empty', async () => {
      await expect(new OpenAIService().createJobEmbedding('', '', '', '')).resolves.toEqual([]);
    });

    it('logs and rethrows when an embedding fails', async () => {
      h.create.mockRejectedValue(new Error('fail'));
      await expect(new OpenAIService().createJobEmbedding('a', 'b', 'c', 'd')).rejects.toThrow('fail');
      expect(logger.error).toHaveBeenCalledWith('Error creating job description embedding:', expect.any(Error));
    });
  });
});
