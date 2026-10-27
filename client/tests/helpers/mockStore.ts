import { combineReducers, configureStore } from '@reduxjs/toolkit'
import auth from '@/redux/features/auth'
import utils from '@/redux/features/utils'
import notifications from '@/redux/features/notification'
import job from '@/redux/features/job'
import interview from '@/redux/features/interview'
import course from '@/redux/features/course'

const reducer = combineReducers({ auth, utils, notifications, job, interview, course })
type RootState = ReturnType<typeof reducer>

/** Build a fresh store with optional preloaded (partial) state per slice. */
export function createMockStore(preloadedState: Record<string, any> = {}) {
  const base = configureStore({ reducer })
  const initial = base.getState() as Record<string, any>
  const merged: Record<string, any> = {}
  for (const key of Object.keys(initial)) {
    merged[key] = { ...initial[key], ...(preloadedState[key] ?? {}) }
  }
  return configureStore({ reducer, preloadedState: merged as RootState })
}

export type MockStore = ReturnType<typeof createMockStore>
