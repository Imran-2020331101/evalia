import { configureStore } from '@reduxjs/toolkit'
import utils from '../features/utils'

export const store = configureStore({
  reducer: {
    utils
  },
})


export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
