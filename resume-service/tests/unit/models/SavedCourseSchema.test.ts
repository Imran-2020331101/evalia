import { describe, it, expect } from 'vitest';
import { SavedCourse } from '../../../src/models/SavedCourseSchema';

describe('SavedCourse model', () => {
  it('validates a candidate with courses', () => {
    const d = new SavedCourse({
      candidateId: 'c1',
      savedCourses: [{ videoId: 'v1', title: 'T', thumbnails: { default: { url: 'u' } }, publishedAt: new Date() }],
    });
    expect(d.validateSync()).toBeUndefined();
    expect(d.savedCourses).toHaveLength(1);
  });
  it('requires candidateId', () => {
    expect(new SavedCourse({}).validateSync()?.errors.candidateId).toBeDefined();
  });
  it('requires videoId and title on each saved course', () => {
    const err = new SavedCourse({ candidateId: 'c', savedCourses: [{}] }).validateSync();
    expect(err?.errors['savedCourses.0.videoId']).toBeDefined();
    expect(err?.errors['savedCourses.0.title']).toBeDefined();
  });
  it('has timestamps and a candidateId index', () => {
    expect(SavedCourse.schema.get('timestamps')).toBe(true);
    expect(SavedCourse.schema.indexes().some(([k]) => 'candidateId' in k)).toBe(true);
  });
});
