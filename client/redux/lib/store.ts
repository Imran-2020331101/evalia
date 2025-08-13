import { configureStore } from '@reduxjs/toolkit'
import utils from '../features/utils'
import notifications from '../features/notification'
import job from '../features/job'

export const store = configureStore({
  reducer: {
    utils,
    notifications,
    job
  },
})


export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
