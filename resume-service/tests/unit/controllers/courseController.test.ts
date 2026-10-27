import { describe, it, expect, vi, beforeEach } from 'vitest';

const { searchYoutube } = vi.hoisted(() => ({ searchYoutube: vi.fn() }));
vi.mock('../../../src/services/courseService', () => ({ courseService: { searchYoutube } }));

import { courseController } from '../../../src/controllers/courseController';
import Resume from '../../../src/models/Resume';
import { SavedCourse } from '../../../src/models/SavedCourseSchema';
import { BadRequestError } from '../../../src/errors';
import { invoke } from '../../helpers/httpMocks';
import { mockQuery, fakeDoc } from '../../helpers/testDb';

beforeEach(() => { searchYoutube.mockReset(); vi.restoreAllMocks(); });

describe('personalizedCourseSuggestion', () => {
  const run = (query: any) => invoke(courseController.personalizedCourseSuggestion, { query });

  it('400s without candidateEmail', async () => {
    const { error } = await run({});
    expect(error).toBeInstanceOf(BadRequestError);
    expect(error.message).toBe('Candidate email is required');
  });

  it('forwards a not-found error from orFail with a descriptive message', async () => {
    const q = mockQuery(null);
    vi.spyOn(Resume, 'findOne').mockReturnValue(q as any);
    const { error } = await run({ candidateEmail: 'a@b.co' });
    expect(error.message).toBe('Resume not found for email: a@b.co');
  });

  it('uses analysis keywords first', async () => {
    vi.spyOn(Resume, 'findOne').mockReturnValue(mockQuery({ analysis: { keywords: ['react', 'node'] }, skills: { technical: ['x'] }, industry: 'Others' }) as any);
    searchYoutube.mockResolvedValue({ courses: [], totalResults: 0 });
    const { status, body } = await run({ candidateEmail: 'a@b.co' });
    expect(Resume.findOne).toHaveBeenCalledWith({ uploadedBy: 'a@b.co' });
    expect(searchYoutube).toHaveBeenCalledWith('react node tutorial+course', 10);
    expect(status).toBe(200);
    expect(body).toEqual({ success: true, data: { courses: [], totalResults: 0 } });
  });

  it('falls back to the first 5 technical skills', async () => {
    vi.spyOn(Resume, 'findOne').mockReturnValue(mockQuery({ skills: { technical: ['a', 'b', 'c', 'd', 'e', 'f'] } }) as any);
    searchYoutube.mockResolvedValue({});
    await run({ candidateEmail: 'a@b.co' });
    expect(searchYoutube).toHaveBeenCalledWith('a b c d e tutorial+course', 10);
  });

  it('falls back to industry, then to a generic phrase', async () => {
    searchYoutube.mockResolvedValue({});
    vi.spyOn(Resume, 'findOne').mockReturnValue(mockQuery({ industry: 'STEM & Technical' }) as any);
    await run({ candidateEmail: 'a@b.co' });
    expect(searchYoutube).toHaveBeenLastCalledWith('STEM & Technical tutorial+course', 10);
    vi.spyOn(Resume, 'findOne').mockReturnValue(mockQuery({}) as any);
    await run({ candidateEmail: 'a@b.co' });
    expect(searchYoutube).toHaveBeenLastCalledWith('professional development tutorial+course', 10);
  });

  it('caps the query at 8 keywords (and drops the course suffix when exceeded)', async () => {
    vi.spyOn(Resume, 'findOne').mockReturnValue(mockQuery({ analysis: { keywords: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] } }) as any);
    searchYoutube.mockResolvedValue({});
    await run({ candidateEmail: 'a@b.co' });
    expect(searchYoutube).toHaveBeenCalledWith('1 2 3 4 5 6 7 8', 10);
  });

  it('forwards YouTube errors', async () => {
    vi.spyOn(Resume, 'findOne').mockReturnValue(mockQuery({}) as any);
    searchYoutube.mockRejectedValue(new Error('quota'));
    expect((await run({ candidateEmail: 'a@b.co' })).error.message).toBe('quota');
  });
});

describe('saveCourse', () => {
  const course = { videoId: 'v1', title: 'T', description: 'D', channelId: 'c', channelTitle: 'CT', thumbnails: {}, publishedAt: '2024' };
  const run = (body: any, params: any = { candidateId: 'cand' }) => invoke(courseController.saveCourse, { body, params });

  it('400s without videoId', async () => {
    expect((await run({ title: 'x' })).error).toBeInstanceOf(BadRequestError);
  });
  it('400s without candidateId', async () => {
    expect((await run(course, {})).error.message).toBe('Candidate ID and Video ID are required');
  });

  it('creates a new saved-courses document', async () => {
    vi.spyOn(SavedCourse, 'findOne').mockReturnValue(mockQuery(null) as any);
    const created = { candidateId: 'cand', savedCourses: [course] };
    const create = vi.spyOn(SavedCourse, 'create').mockResolvedValue(created as any);
    const { status, body } = await run(course);
    expect(create).toHaveBeenCalledWith({ candidateId: 'cand', savedCourses: [course] });
    expect(status).toBe(200);
    expect(body).toEqual({ success: true, data: created });
  });

  it('appends a course to an existing list', async () => {
    const doc = fakeDoc({ candidateId: 'cand', savedCourses: [{ videoId: 'other' }] });
    vi.spyOn(SavedCourse, 'findOne').mockReturnValue(mockQuery(doc) as any);
    const { status } = await run(course);
    expect(doc.savedCourses).toHaveLength(2);
    expect(doc.save).toHaveBeenCalled();
    expect(status).toBe(200);
  });

  it('does not duplicate an already-saved course', async () => {
    const doc = fakeDoc({ candidateId: 'cand', savedCourses: [{ videoId: 'v1' }] });
    vi.spyOn(SavedCourse, 'findOne').mockReturnValue(mockQuery(doc) as any);
    await run(course);
    expect(doc.savedCourses).toHaveLength(1);
    expect(doc.save).not.toHaveBeenCalled();
  });

  it('forwards db errors', async () => {
    vi.spyOn(SavedCourse, 'findOne').mockReturnValue(mockQuery(null, new Error('db')) as any);
    expect((await run(course)).error.message).toBe('db');
  });
});

describe('fetchSavedCourses', () => {
  it('returns each document as JSON', async () => {
    const docs = [fakeDoc({ candidateId: 'c', savedCourses: [] })];
    vi.spyOn(SavedCourse, 'find').mockReturnValue(mockQuery(docs) as any);
    const { status, body } = await invoke(courseController.fetchSavedCourses, { params: { candidateId: 'c' } });
    expect(SavedCourse.find).toHaveBeenCalledWith({ candidateId: 'c' });
    expect(status).toBe(200);
    expect(body).toEqual({ success: true, data: [{ candidateId: 'c', savedCourses: [] }] });
  });
  it('returns an empty list', async () => {
    vi.spyOn(SavedCourse, 'find').mockReturnValue(mockQuery([]) as any);
    expect((await invoke(courseController.fetchSavedCourses, { params: { candidateId: 'c' } })).body.data).toEqual([]);
  });
});

describe('removeCourseFromSavedList', () => {
  const run = (params: any) => invoke(courseController.removeCourseFromSavedList, { params });

  it('400s on missing params', async () => {
    expect((await run({ candidateId: 'c' })).error).toBeInstanceOf(BadRequestError);
    expect((await run({ videoId: 'v' })).error).toBeInstanceOf(BadRequestError);
  });

  it('errors when the candidate has no saved list', async () => {
    vi.spyOn(SavedCourse, 'findOne').mockReturnValue(mockQuery(null) as any);
    expect((await run({ candidateId: 'c', videoId: 'v' })).error.message).toBe('Saved courses not found for candidate: c');
  });

  it('removes only the requested video and saves', async () => {
    const doc = fakeDoc({ candidateId: 'c', savedCourses: [{ videoId: 'v1' }, { videoId: 'v2' }] });
    vi.spyOn(SavedCourse, 'findOne').mockReturnValue(mockQuery(doc) as any);
    const { status, body } = await run({ candidateId: 'c', videoId: 'v1' });
    expect(doc.savedCourses).toEqual([{ videoId: 'v2' }]);
    expect(doc.save).toHaveBeenCalled();
    expect(status).toBe(200);
    expect(body.message).toBe('Course removed successfully');
  });
});
