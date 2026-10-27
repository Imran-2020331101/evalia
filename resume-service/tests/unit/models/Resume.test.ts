import { describe, it, expect } from 'vitest';
import Resume from '../../../src/models/Resume';

const valid = { filename: 'r.pdf', fileLink: 'http://x/r.pdf', uploadedBy: 'a@b.co' };

describe('Resume model', () => {
  it('validates a minimal document and applies defaults', () => {
    const d = new Resume(valid);
    expect(d.validateSync()).toBeUndefined();
    expect(d.status).toBe('processing');
    expect(d.uploadedAt).toBeInstanceOf(Date);
    expect(d.processedAt).toBeInstanceOf(Date);
    expect(d.skills?.technical).toHaveLength(0);
  });

  it.each(['filename', 'fileLink', 'uploadedBy'])('requires %s', (field) => {
    const data: any = { ...valid };
    delete data[field];
    const err = new Resume(data).validateSync();
    expect(err?.errors[field]).toBeDefined();
  });

  it('rejects invalid industry and status enums', () => {
    const err = new Resume({ ...valid, industry: 'Nope', status: 'weird' } as any).validateSync();
    expect(err?.errors.industry).toBeDefined();
    expect(err?.errors.status).toBeDefined();
  });

  it('accepts every valid industry', () => {
    for (const industry of ['STEM & Technical', 'Business, Finance & Administration', 'Creative, Media & Communication',
      'Education, Social & Legal Services', 'Skilled Trades, Labor & Services', 'Others']) {
      expect(new Resume({ ...valid, industry }).validateSync()).toBeUndefined();
    }
  });

  it('stores nested structures', () => {
    const d = new Resume({
      ...valid,
      skills: { technical: ['ts'] },
      experience: [{ job_title: 'Dev', company: 'A', description: ['x'] }],
      education: [{ degree: 'BSc' }],
      projects: [{ title: 'P', technologies: ['t'] }],
      certifications: [{ title: 'C' }],
      awards: [{ title: 'A' }],
      contact: { email: 'a@b.co' },
      metadata: { pages: 2, info: { any: 'thing' }, version: '1' },
      analysis: { wordCount: 5, keywords: ['k'] },
    });
    expect(d.validateSync()).toBeUndefined();
    expect(d.experience![0].job_title).toBe('Dev');
    expect(d.metadata?.pages).toBe(2);
    expect(d.analysis?.keywords?.[0]).toBe('k');
  });

  it('declares timestamps and indexes', () => {
    expect(Resume.schema.get('timestamps')).toBe(true);
    const keys = Resume.schema.indexes().map(([k]) => Object.keys(k)[0]);
    expect(keys).toEqual(expect.arrayContaining(['uploadedAt', 'uploadedBy', 'status', 'skills.technical']));
  });
});
