import { configureStore } from '@reduxjs/toolkit'
import utils from '../features/utils'
import notifications from '../features/notification'
import job from '../features/job'
import auth from '../features/auth'
import interview from '../features/interview'

export const store = configureStore({
  reducer: {
    auth,
    utils,
    notifications,
    job,
    interview
  },
})


export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
