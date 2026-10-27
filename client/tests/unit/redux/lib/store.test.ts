import { describe, expect, it } from 'vitest'
import { store } from '@/redux/lib/store'
import { createMockStore } from '../../../helpers/mockStore'

describe('store', () => {
  it('registers all slices', () => {
    expect(Object.keys(store.getState()).sort()).toEqual(['auth', 'course', 'interview', 'job', 'notifications', 'utils'])
  })
  it('dispatch updates state', () => {
    store.dispatch({ type: 'utils/toggleIsShowHamburgerMenu' })
    expect(store.getState().utils.isShowHamburgerMenu).toBe(true)
  })
  it('createMockStore merges preloaded partial state', () => {
    const s = createMockStore({ job: { saveJobId: 'x' } })
    expect(s.getState().job.saveJobId).toBe('x')
    expect(s.getState().job.savedJobs).toEqual([])
    expect(s.getState().auth.isSignedIn).toBe(false)
  })
})
