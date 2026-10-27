import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PassThrough } from 'stream';

const h = vi.hoisted(() => ({
  pdfParse: vi.fn(),
  openRouter: vi.fn(),
  upload_stream: vi.fn(),
  createReadStream: vi.fn(),
  extractedSave: vi.fn(),
  extractedCtor: vi.fn(),
  deletePoints: vi.fn(),
  globalSearch: vi.fn(),
  createJobEmbedding: vi.fn(),
}));

vi.mock('pdf-parse', () => ({ default: h.pdfParse }));
vi.mock('../../../src/config/OpenRouter', () => ({ default: h.openRouter }));
vi.mock('../../../src/config/Cloudinary', () => ({ default: { uploader: { upload_stream: h.upload_stream } } }));
vi.mock('streamifier', () => ({ default: { createReadStream: h.createReadStream } }));
vi.mock('../../../src/models/ExtractedText', () => ({
  ExtractedResume: class {
    constructor(d: any) { h.extractedCtor(d); }
    save = h.extractedSave;
  },
}));
vi.mock('../../../src/services/QdrantService', () => ({
  qdrantService: { deletePointsByUserId: h.deletePoints, globalSearch: h.globalSearch },
}));
vi.mock('../../../src/services/OpenAIService', () => ({
  openAIService: { createJobEmbedding: h.createJobEmbedding },
}));

import resumeService from '../../../src/services/resumeService';
import Resume from '../../../src/models/Resume';
import logger from '../../../src/utils/logger';
import { mockQuery, fakeDoc } from '../../helpers/testDb';

beforeEach(() => {
  Object.values(h).forEach((f) => f.mockReset());
  vi.restoreAllMocks();
});

describe('uploadToCloudinary', () => {
  const setup = (cb: (done: (e: any, r: any) => void) => void) => {
    h.upload_stream.mockImplementation((_opts: any, done: any) => {
      const sink = new PassThrough();
      setImmediate(() => cb(done));
      return sink;
    });
    h.createReadStream.mockImplementation(() => new PassThrough());
  };

  it('uploads with raw resource type and resolves with the result', async () => {
    setup((done) => done(null, { secure_url: 'https://c/x.pdf', public_id: 'p', url: 'http://c/x.pdf' }));
    const buf = Buffer.from('pdf');
    const res = await resumeService.uploadToCloudinary(buf, 'folder', 'user1');
    expect(res.secure_url).toBe('https://c/x.pdf');
    expect(h.upload_stream.mock.calls[0][0]).toMatchObject({
      resource_type: 'raw', folder: 'folder', public_id: 'user1.pdf', overwrite: true, access_mode: 'public',
      use_filename: true, unique_filename: false, invalidate: true,
    });
    expect(h.createReadStream).toHaveBeenCalledWith(buf);
  });

  it('rejects with the cloudinary error when there is no result', async () => {
    setup((done) => done(new Error('cloud down'), undefined));
    await expect(resumeService.uploadToCloudinary(Buffer.from('x'), 'f', 'u')).rejects.toThrow('cloud down');
  });
});

describe('extractText', () => {
  it('returns text and metadata from pdf-parse', async () => {
    h.pdfParse.mockResolvedValue({ text: 'hello', numpages: 2, info: { Title: 't' }, version: '1.10' });
    const buf = Buffer.from('pdf');
    await expect(resumeService.extractText(buf)).resolves.toEqual({ text: 'hello', metadata: { pages: 2, info: { Title: 't' }, version: '1.10' } });
    expect(h.pdfParse).toHaveBeenCalledWith(buf);
  });
  it('propagates parse errors', async () => {
    h.pdfParse.mockRejectedValue(new Error('bad pdf'));
    await expect(resumeService.extractText(Buffer.from('x'))).rejects.toThrow('bad pdf');
  });
});

describe('asynchronusTextProcesing', () => {
  it('extracts, saves ExtractedResume and logs', async () => {
    h.pdfParse.mockResolvedValue({ text: 'hello', numpages: 1, info: {}, version: 'v' });
    h.extractedSave.mockResolvedValue(undefined);
    await resumeService.asynchronusTextProcesing('u1', 'a@b.co', Buffer.from('x'));
    expect(h.extractedCtor).toHaveBeenCalledWith({ text: 'hello', metadata: { pages: 1, info: {}, version: 'v' }, userEmail: 'a@b.co', userId: 'u1' });
    expect(h.extractedSave).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('saved successfully'), expect.objectContaining({ userId: 'u1', extractedDataKeys: ['text', 'metadata'] }));
  });
  it('rejects if saving fails', async () => {
    h.pdfParse.mockResolvedValue({ text: 't', numpages: 1, info: {}, version: 'v' });
    h.extractedSave.mockRejectedValue(new Error('db'));
    await expect(resumeService.asynchronusTextProcesing('u', 'e', Buffer.from('x'))).rejects.toThrow('db');
  });
});

describe('analyzeResume', () => {
  const parsed = { name: 'J', email: 'j@x.com', skills: { technical: ['ts'] } };

  it('merges AI output with text metrics (json string response)', async () => {
    h.openRouter.mockResolvedValue(JSON.stringify(parsed));
    const out = await resumeService.analyzeResume('John Doe john@example.com +1 555 123 4567');
    expect(out).toMatchObject({ ...parsed, wordCount: 7, characterCount: 41, hasEmail: true, hasPhone: true });
    expect(h.openRouter.mock.calls[0][0]).toContain('John Doe john@example.com');
  });

  it('strips ```json fences', async () => {
    h.openRouter.mockResolvedValue('```json\n' + JSON.stringify(parsed) + '\n```');
    expect((await resumeService.analyzeResume('x')).name).toBe('J');
  });

  it('strips bare ``` fences', async () => {
    h.openRouter.mockResolvedValue('```\n' + JSON.stringify(parsed) + '\n```');
    expect((await resumeService.analyzeResume('x')).name).toBe('J');
  });

  it('reports no email / phone for plain text', async () => {
    h.openRouter.mockResolvedValue('{}');
    const out = await resumeService.analyzeResume('just words');
    expect(out.hasEmail).toBe(false);
    expect(out.hasPhone).toBe(false);
  });

  it('passes through non-string AI responses', async () => {
    h.openRouter.mockResolvedValue(parsed);
    expect((await resumeService.analyzeResume('x')).name).toBe('J');
  });

  it('throws on invalid JSON from the model', async () => {
    h.openRouter.mockResolvedValue('not json');
    await expect(resumeService.analyzeResume('x')).rejects.toThrow(SyntaxError);
  });

  it('propagates LLM failures', async () => {
    h.openRouter.mockRejectedValue(new Error('429'));
    await expect(resumeService.analyzeResume('x')).rejects.toThrow('429');
  });
});

describe('updateResume', () => {
  it('creates a new resume when none exists for the uploader', async () => {
    vi.spyOn(Resume, 'findOne').mockReturnValue(mockQuery(null) as any);
    const save = vi.spyOn(Resume.prototype, 'save').mockImplementation(async function (this: any) { return this; });
    const saved = await resumeService.updateResume({ filename: 'f', fileLink: 'l', uploadedBy: 'a@b.co' }, 'cand');
    expect(Resume.findOne).toHaveBeenCalledWith({ uploadedBy: 'a@b.co' });
    expect(save).toHaveBeenCalled();
    expect(saved.filename).toBe('f');
    expect(h.deletePoints).not.toHaveBeenCalled();
  });

  it('updates an existing resume and deletes stale vectors', async () => {
    const existing = fakeDoc({ filename: 'old', uploadedBy: 'a@b.co' });
    vi.spyOn(Resume, 'findOne').mockReturnValue(mockQuery(existing) as any);
    h.deletePoints.mockResolvedValue({});
    const out = await resumeService.updateResume({ filename: 'new', uploadedBy: 'a@b.co' }, 'cand');
    expect(h.deletePoints).toHaveBeenCalledWith('cand');
    expect(existing.filename).toBe('new');
    expect(existing.save).toHaveBeenCalled();
    expect(out).toBe(existing);
  });

  it('does not save if deleting old vectors fails', async () => {
    const existing = fakeDoc({ filename: 'old' });
    vi.spyOn(Resume, 'findOne').mockReturnValue(mockQuery(existing) as any);
    h.deletePoints.mockRejectedValue(new Error('qdrant'));
    await expect(resumeService.updateResume({ uploadedBy: 'a' }, 'c')).rejects.toThrow('qdrant');
    expect(existing.save).not.toHaveBeenCalled();
  });
});

describe('extractDetailsFromJobDescription', () => {
  const jd = { industry: 'STEM & Technical', skills: 's', experience: 'e', projects: 'p', education: 'd' };
  it('parses a JSON response', async () => {
    h.openRouter.mockResolvedValue(JSON.stringify(jd));
    await expect(resumeService.extractDetailsFromJobDescription('desc')).resolves.toEqual(jd);
    expect(h.openRouter.mock.calls[0][0]).toContain('desc');
  });
  it('parses fenced responses', async () => {
    h.openRouter.mockResolvedValue('```json\n' + JSON.stringify(jd) + '\n```');
    await expect(resumeService.extractDetailsFromJobDescription('desc')).resolves.toEqual(jd);
    h.openRouter.mockResolvedValue('```\n' + JSON.stringify(jd) + '```');
    await expect(resumeService.extractDetailsFromJobDescription('desc')).resolves.toEqual(jd);
  });
  it('throws on invalid JSON', async () => {
    h.openRouter.mockResolvedValue('nope');
    await expect(resumeService.extractDetailsFromJobDescription('d')).rejects.toThrow(SyntaxError);
  });
});

describe('parseCandidateScores', () => {
  const pt = (id: any, score: number, name = 'N') => ({ id: 1, version: 1, score, payload: { 'candidate-id': id, 'candidate-name': name } });

  it('returns [] for no data', () => expect(resumeService.parseCandidateScores([])).toEqual([]));

  it('merges section scores per candidate and rounds to 2 decimals', () => {
    const out = resumeService.parseCandidateScores([
      { section: 'skills', result: { points: [pt('c1', 0.12345), pt('c2', 0.5)] } },
      { section: 'education', result: { points: [pt('c1', 0.9876)] } },
      { section: 'experience', result: { points: [pt('c1', 0.5551)] } },
      { section: 'projects', result: { points: [pt('c2', 0.1)] } },
    ] as any);
    expect(out).toEqual([
      { 'candidate-id': 'c1', candidateName: 'N', skills: 0.12, education: 0.99, experience: 0.56, projects: null },
      { 'candidate-id': 'c2', candidateName: 'N', skills: 0.5, education: null, experience: null, projects: 0.1 },
    ]);
  });

  it('skips points without a string candidate-id and ignores unknown sections', () => {
    const out = resumeService.parseCandidateScores([
      { section: 'skills', result: { points: [pt(undefined, 1), pt(5, 1), { id: 1, version: 1, score: 1 }, pt('c1', 0.3)] } },
      { section: 'project', result: { points: [pt('c1', 0.9)] } },
    ] as any);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ 'candidate-id': 'c1', skills: 0.3, projects: null });
  });

  it('BUG: embeddings uploader names the section "project" so project scores are silently dropped', () => {
    const out = resumeService.parseCandidateScores([{ section: 'project', result: { points: [pt('c1', 0.9)] } }] as any);
    expect(out[0].projects).toBeNull();
  });
});

describe('globalResumeSearch', () => {
  it('embeds the requirement, searches Qdrant and parses scores', async () => {
    h.createJobEmbedding.mockResolvedValue([{ section: 'skills', embedding: [1] }]);
    h.globalSearch.mockResolvedValue([{ section: 'skills', result: { points: [{ id: 1, version: 1, score: 0.5, payload: { 'candidate-id': 'c1', 'candidate-name': 'A' } }] } }]);
    const out = await resumeService.globalResumeSearch({ industry: 'Others', skills: 's', experience: 'e', projects: 'p', education: 'd' }, '7');
    expect(h.createJobEmbedding).toHaveBeenCalledWith('s', 'e', 'p', 'd');
    expect(h.globalSearch).toHaveBeenCalledWith([{ section: 'skills', embedding: [1] }], 7, 'resume-test');
    expect(out).toEqual([{ 'candidate-id': 'c1', candidateName: 'A', skills: 0.5, education: null, experience: null, projects: null }]);
  });
  it('propagates embedding failures', async () => {
    h.createJobEmbedding.mockRejectedValue(new Error('openai'));
    await expect(resumeService.globalResumeSearch({} as any, '1')).rejects.toThrow('openai');
  });
});
