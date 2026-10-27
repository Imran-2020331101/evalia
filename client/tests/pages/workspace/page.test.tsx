// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'
import gsap from '@/tests/helpers/gsapMock'

const calls = vi.hoisted(() => ({ names: [] as string[] }))
vi.mock('@/redux/features/auth', async (o) => ({
  ...(await o<any>()),
  fetchUserData: () => (calls.names.push('user'), { type: 'm/user' }),
  getAllOrganizations: () => (calls.names.push('orgs'), { type: 'm/orgs' }),
}))
vi.mock('@/redux/features/job', async (o) => ({
  ...(await o<any>()),
  getAllAppliedJobs: () => (calls.names.push('applied'), { type: 'm/applied' }),
  getAllSavedJobs: () => (calls.names.push('saved'), { type: 'm/saved' }),
}))
vi.mock('@/redux/features/notification', async (o) => ({
  ...(await o<any>()),
  getAllNotifications: () => (calls.names.push('notifs'), { type: 'm/notifs' }),
}))

import Page from '@/app/workspace/page'

beforeEach(() => { calls.names = [] })

describe('workspace landing page', () => {
  it('renders logo and description and starts the intro animation', () => {
    renderWithProviders(<Page />)
    expect(screen.getByAltText('workspace')).toHaveAttribute('id', 'logo')
    expect(screen.getByText(/One platform. Infinite possibilities/)).toHaveAttribute('id', 'description')
    expect(gsap.fromTo).toHaveBeenCalled()
  })

  it('bootstraps all workspace data on first mount', () => {
    renderWithProviders(<Page />)
    expect(calls.names.sort()).toEqual(['applied', 'notifs', 'orgs', 'saved', 'user'])
  })

  it('skips fetches for data already in the store', () => {
    renderWithProviders(<Page />, {
      preloadedState: {
        auth: { user: { user: { email: 'a' } }, organizations: [{ id: 1 }] },
        job: { appliedJobs: [{ _id: 1 }], savedJobs: [{ _id: 2 }] },
        notifications: { allNotifications: [{ id: 1 }] },
      },
    })
    expect(calls.names).toEqual([])
  })
})
