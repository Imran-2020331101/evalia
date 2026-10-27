import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import reducer, * as s from '@/redux/features/interview'
import { createMockStore } from '../../../helpers/mockStore'
import { runThunkCase, silenceConsole } from '../../../helpers/thunkHarness'

vi.mock('axios', () => ({ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }))

beforeEach(silenceConsole)
afterEach(() => vi.restoreAllMocks())

describe('interview slice', () => {
  const c = runThunkCase(axios, {
    name: 'getallInterviews', thunk: s.getallInterviews, method: 'get',
    url: 'http://localhost:8080/api/interviews/', data: { data: [{ id: 1 }] }, fallback: 'Failed fetching all interviews',
  })
  it('thunk success', c.success)
  it('thunk server error', c.serverError)
  it('thunk network error', c.networkError)

  it('initial state', () => {
    const st = reducer(undefined, { type: 'x' })
    expect(st.allInterviews).toEqual([])
    expect(st.getAllInterviewStatus).toBe('idle')
    expect(st.previewedInterviewSummaryId).toBeNull()
  })
  it('lifecycle through store + selectors', async () => {
    const store = createMockStore()
    ;(axios.get as any).mockResolvedValueOnce({ data: { data: [{ id: 'a' }] } })
    const p = store.dispatch(s.getallInterviews() as any)
    expect(s.getAllInterviewStatus(store.getState())).toBe('pending')
    await p
    expect(s.getAllInterviewStatus(store.getState())).toBe('success')
    expect(s.allInterviews(store.getState())).toEqual([{ id: 'a' }])
    ;(axios.get as any).mockRejectedValueOnce(new Error('x'))
    await store.dispatch(s.getallInterviews() as any)
    expect(s.getAllInterviewStatus(store.getState())).toBe('error')
  })
  it('setPreviewedInterviewSummaryId and other selectors', () => {
    const store = createMockStore({ interview: { pendingInterviews: [1], completedInterview: [2], expiredInterviews: [3] } })
    store.dispatch(s.setPreviewedInterviewSummaryId('i1'))
    const st = store.getState()
    expect(s.previewedInterviewSummaryId(st)).toBe('i1')
    expect(s.pendingInterviews(st)).toEqual([1])
    expect(s.completedInterview(st)).toEqual([2])
    expect(s.expiredInterviews(st)).toEqual([3])
  })
})
