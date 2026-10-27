// @vitest-environment jsdom
import { beforeEach, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

const push = vi.fn()
vi.mock('@/custom-hooks/useProgressRouter', () => ({ useProgressRouter: () => ({ push }) }))
vi.mock('@/components/profile/ProfileSideBar', () => ({ default: () => <div data-testid="sidebar" /> }))
vi.mock('@/components/ui/dynamicBreadCrumb', () => ({ default: () => <div data-testid="crumbs" /> }))

import Layout from '@/app/profile/layout'

beforeEach(() => { push.mockClear(); vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true }))) })

it('renders sidebar, breadcrumbs, children and nav links; hides logout when signed out', () => {
  renderWithProviders(<Layout><p>kid</p></Layout>)
  expect(screen.getByTestId('sidebar')).toBeInTheDocument()
  expect(screen.getByTestId('crumbs')).toBeInTheDocument()
  expect(screen.getByText('kid')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'EVALIA' })).toHaveAttribute('href', '/')
  expect(screen.getByRole('link', { name: 'Workspace' })).toHaveAttribute('href', '/workspace')
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})

it('logs out: calls api, clears user and redirects to login', async () => {
  const { store } = renderWithProviders(<Layout><p>kid</p></Layout>, { preloadedState: { auth: { user: { user: { email: 'a@b.c' } } } } })
  await userEvent.click(screen.getByRole('button'))
  await waitFor(() => expect(push).toHaveBeenCalledWith('/auth/login'))
  expect(fetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' })
  expect(store.getState().auth.user).toBeNull()
})
