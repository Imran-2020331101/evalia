// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CandidatesWorkSpaceMenu from '@/components/workspace/menu/CandidatesWorkSpaceMenu'
import { renderWithProviders } from '../../../helpers/renderWithProviders'

vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))

const user = { user: { name: 'Sam Smith', roles: ['USER'] } }

describe('CandidatesWorkSpaceMenu', () => {
  it('renders all sections and links with zero counts', () => {
    renderWithProviders(<CandidatesWorkSpaceMenu />, { preloadedState: { auth: { user } } })
    expect(screen.getByText('Jobs')).toBeInTheDocument()
    expect(screen.getAllByText('Saved (0)')).toHaveLength(2)
    expect(screen.getByText('Applied (0)')).toBeInTheDocument()
    expect(screen.getAllByText('Explore')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'All (0)' })).toHaveAttribute('href', '/workspace/interviews/all')
    expect(screen.getByRole('link', { name: 'Pending (0)' })).toHaveAttribute('href', '/workspace/interviews/pending')
    expect(screen.getByRole('link', { name: 'Expired (0)' })).toHaveAttribute('href', '/workspace/interviews/expired')
    expect(screen.getByText('Sam')).toBeInTheDocument()
  })

  it('counts interviews and unread notifications', () => {
    renderWithProviders(<CandidatesWorkSpaceMenu />, {
      preloadedState: {
        auth: { user },
        notifications: { allNotifications: [{ isRead: false }] },
        job: { savedJobs: [{ _id: 1 }], appliedJobs: [{ _id: 2 }, { _id: 3 }] },
        interview: { allInterviews: [{ interviewStatus: 'COMPLETED' }, { interviewStatus: 'PENDING' }, { interviewStatus: 'PENDING' }] },
      },
    })
    expect(screen.getByText('Applied (2)')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'All (3)' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Completed (1)' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Pending (2)' })).toBeInTheDocument()
    expect(screen.getByText('1', { selector: 'span' })).toBeInTheDocument()
  })

  it('collapses a category when its header is clicked', async () => {
    renderWithProviders(<CandidatesWorkSpaceMenu />, { preloadedState: { auth: { user } } })
    const list = screen.getByText('Applied (0)').closest('ul')!
    expect(list).toHaveClass('flex')
    await userEvent.click(screen.getByRole('button', { name: /Jobs/ }))
    expect(list).toHaveClass('hidden')
    await userEvent.click(screen.getByRole('button', { name: /Courses/ }))
    await userEvent.click(screen.getByRole('button', { name: /Interviews/ }))
  })
})
