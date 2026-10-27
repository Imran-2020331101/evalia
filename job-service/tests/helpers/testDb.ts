import { vi } from 'vitest';

export class DocumentNotFoundError extends Error {
  constructor() {
    super('No document found for query');
    this.name = 'DocumentNotFoundError';
  }
}

/**
 * Fake mongoose Query: chainable, awaitable, supports orFail().
 * `result` is what the query resolves to; `error` makes it reject.
 */
export function chain<T = any>(result: T, error?: unknown) {
  let failOnEmpty = false;
  const run = (): Promise<T> => {
    if (error !== undefined) return Promise.reject(error);
    if (failOnEmpty && (result === null || result === undefined)) {
      return Promise.reject(new DocumentNotFoundError());
    }
    return Promise.resolve(result);
  };
  const q: any = {};
  for (const m of ['sort', 'skip', 'limit', 'lean', 'select']) q[m] = vi.fn(() => q);
  q.orFail = vi.fn(() => {
    failOnEmpty = true;
    return q;
  });
  q.exec = vi.fn(() => run());
  q.then = (res: any, rej: any) => run().then(res, rej);
  q.catch = (rej: any) => run().catch(rej);
  return q;
}

/** Fake mongoose model class with vi.fn statics and a recordable save(). */
export function createModelMock() {
  class FakeModel {
    static ctor = vi.fn();
    static saveMock = vi.fn();
    static find = vi.fn();
    static findOne = vi.fn();
    static findById = vi.fn();
    static findByIdAndUpdate = vi.fn();
    static findByIdAndDelete = vi.fn();
    static findOneAndUpdate = vi.fn();
    static updateOne = vi.fn();
    static updateMany = vi.fn();
    static countDocuments = vi.fn();
    [k: string]: any;
    constructor(data: any = {}) {
      Object.assign(this, data);
      FakeModel.ctor(data);
    }
    save() {
      return FakeModel.saveMock(this);
    }
  }
  return FakeModel;
}

export const OID = (n = 1) => n.toString(16).padStart(24, '0');

export function jobDoc(overrides: Record<string, any> = {}) {
  return {
    _id: { toString: () => OID(1) },
    title: 'Backend Engineer',
    jobDescription: 'Build APIs',
    postedBy: 'user-1',
    views: 0,
    company: { OrganizationId: 'org-1', OrganizationEmail: 'org@x.com', OrganizationName: 'Org' },
    requirements: [{ type: 'high', category: 'lang', description: 'TypeScript' }],
    responsibilities: [{ type: 'high', category: 'dev', description: 'Write code' }],
    skills: [{ type: 'high', category: 'tech', description: 'Node' }],
    applications: [],
    interviewQA: [],
    ...overrides,
  };
}

export const validCreateJobBody = (overrides: Record<string, any> = {}) => ({
  createdBy: 'user-1',
  companyInfo: { organizationId: 'org-1', organizationEmail: 'org@x.com' },
  basic: {
    title: 'Backend Engineer',
    jobDescription: 'Build APIs',
    jobLocation: 'Dhaka',
    salaryFrom: 10,
    salaryTo: 20,
    deadline: '2099-01-01',
    jobType: 'FULL_TIME',
    workPlaceType: 'REMOTE',
    employmentLevelType: 'MID',
  },
  requirements: [{ type: 'high', category: 'lang', description: 'TypeScript' }],
  responsibilities: [{ type: 'high', category: 'dev', description: 'Write code' }],
  skills: [{ type: 'high', category: 'tech', description: 'Node' }],
  ...overrides,
});

/** Invoke an asyncHandler-wrapped express handler with fakes and wait for it to settle. */
export async function invoke(handler: any, req: Partial<{ body: any; params: any; query: any }> = {}) {
  const res: any = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  res.send = vi.fn(() => res);
  const next = vi.fn();
  handler({ body: {}, params: {}, query: {}, ...req }, res, next);
  await new Promise((r) => setImmediate(r));
  return { res, next };
}
