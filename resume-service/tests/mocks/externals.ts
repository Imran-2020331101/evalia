import { vi } from 'vitest';
import { PassThrough } from 'stream';

/**
 * Shared fakes for every external I/O dependency. Integration tests register them with, e.g.
 *   vi.mock('openai', async () => (await import('../mocks/externals')).openaiModule);
 * and then drive behaviour through the `ext` handles.
 */
export const ext = {
  openaiChatCreate: vi.fn(),
  openaiEmbeddingsCreate: vi.fn(),
  qdrantUpsert: vi.fn(),
  qdrantQuery: vi.fn(),
  qdrantDelete: vi.fn(),
  qdrantScroll: vi.fn(),
  cloudinaryUploadStream: vi.fn(),
  pdfParse: vi.fn(),
  axiosGet: vi.fn(),
};

export function resetExternals() {
  Object.values(ext).forEach((f) => f.mockReset());
  // sensible defaults
  ext.openaiEmbeddingsCreate.mockImplementation(async ({ input }: any) => ({ data: [{ embedding: [input.length, 0.5] }] }));
  ext.cloudinaryUploadStream.mockImplementation((_opts: any, done: any) => {
    setImmediate(() => done(null, { url: 'http://res.cloudinary.test/x.pdf', secure_url: 'https://res.cloudinary.test/x.pdf', public_id: 'p' }));
    return new PassThrough();
  });
  ext.pdfParse.mockResolvedValue({ text: 'John Doe\njohn@example.com', numpages: 1, info: {}, version: '1.10' });
}

export const openaiModule = {
  default: class {
    chat = { completions: { create: ext.openaiChatCreate } };
    embeddings = { create: ext.openaiEmbeddingsCreate };
  },
};
export const qdrantModule = {
  QdrantClient: class {
    upsert = ext.qdrantUpsert;
    query = ext.qdrantQuery;
    delete = ext.qdrantDelete;
    scroll = ext.qdrantScroll;
  },
};
export const cloudinaryModule = {
  v2: { config: vi.fn(), uploader: { upload_stream: ext.cloudinaryUploadStream } },
};
export const pdfParseModule = { default: ext.pdfParse };
export const axiosModule = { default: { get: ext.axiosGet } };

export const llmReply = (content: string) => ({ choices: [{ message: { content } }] });

export const sampleParsedResume = {
  name: 'John Doe', email: 'john@example.com', phone: '123', linkedin: '', github: '', location: 'NYC',
  industry: 'STEM & Technical',
  skills: { technical: ['TypeScript'], soft: [], languages: [], tools: [], other: [] },
  education: [{ degree: 'BSc', institution: 'MIT', year: '2020', gpa: '3.9' }],
  experience: [{ job_title: 'Dev', company: 'ACME', duration: '2y', description: ['built things'], achievements: [] }],
  certifications: [], projects: [{ title: 'P', description: 'D', technologies: ['ts'], url: '' }],
  languages: [], awards: [], volunteer: [], interests: [], keywords: ['typescript'],
};
