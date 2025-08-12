import { configureStore } from '@reduxjs/toolkit'
import utils from '../features/utils'
import notifications from '../notificationSlice'

export const store = configureStore({
  reducer: {
    utils,
    notifications,
  },
})


export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
