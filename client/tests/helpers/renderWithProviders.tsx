import React from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createMockStore, type MockStore } from './mockStore'

type Opts = { preloadedState?: Record<string, any>; store?: MockStore } & Omit<RenderOptions, 'wrapper'>

/** Render with a fresh real-reducer redux store. Returns the store for dispatch/state assertions. */
export function renderWithProviders(ui: React.ReactElement, { preloadedState, store, ...options }: Opts = {}) {
  const s = store ?? createMockStore(preloadedState)
  const Wrapper = ({ children }: { children: React.ReactNode }) => <Provider store={s}>{children}</Provider>
  return { store: s, ...render(ui, { wrapper: Wrapper, ...options }) }
}

export * from '@testing-library/react'
