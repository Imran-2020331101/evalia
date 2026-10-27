import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import reducer, * as s from '@/redux/features/course'
import { createMockStore } from '../../../helpers/mockStore'
import { runThunkCase, silenceConsole } from '../../../helpers/thunkHarness'

vi.mock('axios', () => ({ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }))

beforeEach(silenceConsole)
afterEach(() => vi.restoreAllMocks())

const B = 'http://localhost:8080/api/course'

describe('course thunks', () => {
  const cases = [
    { name: 'getAllCourses', thunk: s.getAllCourses, method: 'get', url: `${B}/suggestions`, data: { data: { courses: [] } }, fallback: 'Failed fetching all courses' },
    { name: 'getAllSavedCourses', thunk: s.getAllSavedCourses, method: 'get', url: `${B}/saved/all`, data: { data: [] }, fallback: 'Failed fetching all courses' },
    { name: 'saveCourse', thunk: s.saveCourse, arg: { data: { videoId: 'v' } }, method: 'post', url: `${B}/save`, body: { videoId: 'v' }, data: { data: {} }, fallback: 'Failed fetching all courses' },
    { name: 'unsaveCourse', thunk: s.unsaveCourse, arg: { videoId: 'v1' }, method: 'delete', url: `${B}/delete/v1`, data: { data: {} }, fallback: 'Failed deleting course' },
  ] as const
  for (const c of cases) {
    const h = runThunkCase(axios, c as any)
    it(`${c.name} success`, h.success)
    it(`${c.name} server error`, h.serverError)
    it(`${c.name} network error`, h.networkError)
  }
})

describe('course reducers', () => {
  it('initial state', () => {
    const st = reducer(undefined, { type: 'x' })
    expect(st).toMatchObject({ allCourses: [], savedCourses: [], allCourseStatus: 'idle', saveCourseStatus: 'idle', getAllSaveCourseStatus: 'idle', unsaveCourseStatus: 'idle' })
  })
  it('getAllCourses lifecycle + selectors', async () => {
    const store = createMockStore()
    ;(axios.get as any).mockResolvedValueOnce({ data: { data: { courses: [{ id: 1 }] } } })
    const p = store.dispatch(s.getAllCourses() as any)
    expect(s.allCourseStatus(store.getState())).toBe('pending')
    await p
    expect(s.allCourseStatus(store.getState())).toBe('success')
    expect(s.allCourses(store.getState())).toEqual([{ id: 1 }])
    ;(axios.get as any).mockRejectedValueOnce(new Error('x'))
    await store.dispatch(s.getAllCourses() as any)
    expect(s.allCourseStatus(store.getState())).toBe('error')
  })
  it('getAllSavedCourses lifecycle', async () => {
    const store = createMockStore()
    ;(axios.get as any).mockResolvedValueOnce({ data: { data: [{ savedCourses: ['a'] }] } })
    const p = store.dispatch(s.getAllSavedCourses() as any)
    expect(s.getAllSaveCourseStatus(store.getState())).toBe('pending')
    await p
    expect(s.getAllSaveCourseStatus(store.getState())).toBe('success')
    expect(s.savedCourses(store.getState())).toEqual(['a'])
    ;(axios.get as any).mockRejectedValueOnce(new Error('x'))
    await store.dispatch(s.getAllSavedCourses() as any)
    expect(s.getAllSaveCourseStatus(store.getState())).toBe('error')
  })
  it('saveCourse lifecycle', async () => {
    const store = createMockStore()
    ;(axios.post as any).mockResolvedValueOnce({ data: { data: { savedCourses: ['s'] } } })
    const p = store.dispatch(s.saveCourse({ data: {} }) as any)
    expect(s.saveCourseStatus(store.getState())).toBe('pending')
    await p
    expect(s.saveCourseStatus(store.getState())).toBe('success')
    expect(s.savedCourses(store.getState())).toEqual(['s'])
    ;(axios.post as any).mockRejectedValueOnce(new Error('x'))
    await store.dispatch(s.saveCourse({ data: {} }) as any)
    expect(s.saveCourseStatus(store.getState())).toBe('error')
  })
  it('unsaveCourse lifecycle and manual status setter', async () => {
    const store = createMockStore()
    ;(axios.delete as any).mockResolvedValueOnce({ data: { data: { savedCourses: [] } } })
    const p = store.dispatch(s.unsaveCourse({ videoId: 'v' }) as any)
    expect(s.unsaveCourseStatus(store.getState())).toBe('pending')
    await p
    expect(s.unsaveCourseStatus(store.getState())).toBe('success')
    ;(axios.delete as any).mockRejectedValueOnce(new Error('x'))
    await store.dispatch(s.unsaveCourse({ videoId: 'v' }) as any)
    expect(s.unsaveCourseStatus(store.getState())).toBe('error')
    store.dispatch(s.setUnsaveCourseStatus('idle'))
    expect(s.unsaveCourseStatus(store.getState())).toBe('idle')
  })
})
