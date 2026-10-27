// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RecruitersWorkSpaceMenu from '@/components/workspace/menu/RecruitersWorkSpaceMenu'
import { renderWithProviders } from '../../../helpers/renderWithProviders'
vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))

const user = { user: { name: 'Jane Doe', roles: ['RECRUITER'] } }
const orgs = [{ id: 'o1', organizationName: 'Acme' }, { id: 'o2', organizationName: 'Beta' }]

describe('RecruitersWorkSpaceMenu', () => {
  it('prompts to create an organization when none exist', () => {
    renderWithProviders(<RecruitersWorkSpaceMenu />, { preloadedState: { auth: { user, organizations: [] } } })
    expect(screen.getByText(/no organization/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Create' })).toHaveAttribute('href', '/profile#create-organization')
    expect(screen.getByText('Jane Doe'.slice(0, 2))).toBeInTheDocument()
    expect(screen.getByText('Jane')).toBeInTheDocument()
  })

  it('auto-selects the first org and lists its links', () => {
    const { store } = renderWithProviders(<RecruitersWorkSpaceMenu />, { preloadedState: { auth: { user, organizations: orgs } } })
    expect(store.getState().job.selectedOrgId).toBe('o1')
    expect(screen.getByRole('link', { name: /My Jobs/ })).toHaveAttribute('href', '/workspace/jobs/Acme/my-jobs')
    expect(screen.getByRole('link', { name: /Create/ })).toHaveAttribute('href', '/workspace/jobs/Acme/create')
  })

  it('switches the selected organization on click', async () => {
    const { store } = renderWithProviders(<RecruitersWorkSpaceMenu />, { preloadedState: { auth: { user, organizations: orgs } } })
    await userEvent.click(screen.getByRole('button', { name: /Beta/ }))
    expect(store.getState().job.selectedOrgId).toBe('o2')
    expect(screen.getByRole('link', { name: /My Jobs/ })).toHaveAttribute('href', '/workspace/jobs/Beta/my-jobs')
  })

  it('shows the unread notification count', () => {
    renderWithProviders(<RecruitersWorkSpaceMenu />, {
      preloadedState: { auth: { user, organizations: [] }, notifications: { allNotifications: [{ isRead: false }, { isRead: true }, { isRead: false }] } },
    })
    expect(screen.getByText('2')).toBeInTheDocument()
  })
})
