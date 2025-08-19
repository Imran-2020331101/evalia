import { configureStore } from '@reduxjs/toolkit'
import utils from '../features/utils'
import notifications from '../features/notification'
import job from '../features/job'
import auth from '../features/auth'

export const store = configureStore({
  reducer: {
    auth,
    utils,
    notifications,
    job
  },
})


export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
