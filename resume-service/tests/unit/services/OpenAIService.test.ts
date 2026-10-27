import { describe, it, expect, vi, beforeEach } from 'vitest';

const { create, ctor } = vi.hoisted(() => ({ create: vi.fn(), ctor: vi.fn() }));
vi.mock('openai', () => ({
  default: class {
    embeddings = { create };
    constructor(o: any) { ctor(o); }
  },
}));

import OpenAIService, { openAIService } from '../../../src/services/OpenAIService';
import logger from '../../../src/utils/logger';

const ctorCallsAtImport = [...ctor.mock.calls];

const emb = (v: number[]) => ({ data: [{ embedding: v }] });

describe('OpenAIService', () => {
  const svc = new OpenAIService();
  beforeEach(() => { create.mockReset(); });

  it('constructs the client with OPENAI_API_KEY and exports a singleton', () => {
    expect(ctorCallsAtImport[0]).toEqual([{ apiKey: 'test-openai-key' }]);
    expect(openAIService).toBeInstanceOf(OpenAIService);
  });

  describe('createEmbedding', () => {
    it('trims input and returns the vector', async () => {
      create.mockResolvedValue(emb([1, 2, 3]));
      await expect(svc.createEmbedding('  hello  ')).resolves.toEqual([1, 2, 3]);
      expect(create).toHaveBeenCalledWith({ model: 'text-embedding-3-small', input: 'hello', encoding_format: 'float' });
    });
    it.each(['', '   ', undefined as any])('rejects empty input %j', async (v) => {
      await expect(svc.createEmbedding(v)).rejects.toThrow('Text input cannot be empty');
      expect(create).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalled();
    });
    it('logs and rethrows API errors', async () => {
      create.mockRejectedValue(new Error('api'));
      await expect(svc.createEmbedding('x')).rejects.toThrow('api');
      expect(logger.error).toHaveBeenCalledWith('Error creating embedding:', expect.any(Error));
    });
  });

  describe('createBatchEmbeddings', () => {
    it('rejects empty / undefined input', async () => {
      await expect(svc.createBatchEmbeddings([])).rejects.toThrow('Inputs are empty');
      await expect(svc.createBatchEmbeddings(undefined as any)).rejects.toThrow('Inputs are empty');
    });
    it('embeds each section preserving order', async () => {
      create.mockImplementation(async ({ input }: any) => emb([input.length]));
      const out = await svc.createBatchEmbeddings([{ section: 'skills', text: 'abc' }, { section: 'education', text: 'abcde' }]);
      expect(out).toEqual([{ section: 'skills', embedding: [3] }, { section: 'education', embedding: [5] }]);
    });
    it('propagates failures', async () => {
      create.mockRejectedValue(new Error('x'));
      await expect(svc.createBatchEmbeddings([{ section: 's', text: 't' }])).rejects.toThrow('x');
    });
  });

  describe('createResumeEmbeddings', () => {
    beforeEach(() => { create.mockImplementation(async ({ input }: any) => emb([input.length])); });
    const sections = async (r: any) => (await svc.createResumeEmbeddings(r)).map((e) => e.section);

    it('builds all four sections from a full resume', async () => {
      const inputs: string[] = [];
      create.mockImplementation(async ({ input }: any) => { inputs.push(input); return emb([1]); });
      const out = await svc.createResumeEmbeddings({
        filename: 'f', fileLink: 'l', uploadedBy: 'u',
        skills: { technical: ['ts', 'go'], soft: ['comm'], languages: [], tools: [], other: [] },
        experience: [{ job_title: 'Dev', company: 'A', description: ['x', 'y'] } as any, { job_title: 'QA', company: 'B', description: [] } as any],
        education: [{ degree: 'BSc', institution: 'MIT' } as any],
        projects: [{ title: 'P', description: 'D' } as any],
      });
      expect(out.map((o) => o.section)).toEqual(['skills', 'experience', 'education', 'project']);
      expect(inputs[0]).toBe('ts, go, comm');
      expect(inputs[1]).toBe('Dev at A: x,y. QA at B: ');
      expect(inputs[2]).toBe('BSc from MIT');
      expect(inputs[3]).toBe('P: D');
    });

    it('BUG: the projects section is named "project" (singular) whereas search/parse code expects "projects"', async () => {
      const s = await sections({ filename: 'f', fileLink: 'l', uploadedBy: 'u', projects: [{ title: 'P', description: 'D' }] });
      expect(s).toEqual(['project']);
    });

    it('handles skills given as an array, a string, or an object', async () => {
      const inputs: string[] = [];
      create.mockImplementation(async ({ input }: any) => { inputs.push(input); return emb([1]); });
      const base = { filename: 'f', fileLink: 'l', uploadedBy: 'u' };
      await svc.createResumeEmbeddings({ ...base, skills: ['a', 'b'] as any });
      await svc.createResumeEmbeddings({ ...base, skills: 'plain' as any });
      await svc.createResumeEmbeddings({ ...base, skills: { technical: ['x'], soft: ['y'] } as any });
      expect(inputs).toEqual(['a, b', 'plain', 'x, y']);
    });

    it('skips blank skills text and empty/absent sections, then fails on no inputs', async () => {
      const base = { filename: 'f', fileLink: 'l', uploadedBy: 'u' };
      await expect(svc.createResumeEmbeddings({ ...base, skills: { technical: [], soft: [], languages: [], tools: [], other: [] }, experience: [], education: [], projects: [] }))
        .rejects.toThrow('Inputs are empty');
      await expect(svc.createResumeEmbeddings(base)).rejects.toThrow('Inputs are empty');
    });
  });

  describe('createJobEmbedding', () => {
    it('embeds only non-empty fields sequentially', async () => {
      create.mockImplementation(async ({ input }: any) => emb([input.length]));
      const out = await svc.createJobEmbedding('skills!', '', '   ', 'edu');
      expect(out).toEqual([{ section: 'skills', embedding: [7] }, { section: 'education', embedding: [3] }]);
      expect(create).toHaveBeenCalledTimes(2);
    });
    it('returns [] when all fields are empty', async () => {
      await expect(svc.createJobEmbedding('', '', '', '')).resolves.toEqual([]);
    });
    it('logs and rethrows', async () => {
      create.mockRejectedValue(new Error('down'));
      await expect(svc.createJobEmbedding('s', '', '', '')).rejects.toThrow('down');
      expect(logger.error).toHaveBeenCalledWith('Error creating job description embedding:', expect.any(Error));
    });
  });
});
