// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotificationCard from '@/components/workspace/notifications/NotificationCard'
import { renderWithProviders } from '../../../helpers/renderWithProviders'
import axios from '@/tests/helpers/axiosMock'
import { router } from '../../../helpers/navMock'
vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))

const base = { _id: 'n1', title: 'Hello', message: 'World', createdAt: '2024-01-01T00:00:00Z', isRead: false }

describe('NotificationCard', () => {
  it('renders title/message and no link for default type', () => {
    renderWithProviders(<NotificationCard notification={{ ...base, type: 'whatever' }} />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('World')).toBeInTheDocument()
    expect(screen.queryByText('View details')).not.toBeInTheDocument()
  })

  it('routes to the interview and marks as read for interview_scheduled', async () => {
    const { store } = renderWithProviders(<NotificationCard notification={{ ...base, type: 'interview_scheduled', data: { interviewId: 'i9' } }} />, {
      preloadedState: { notifications: { allNotifications: [{ ...base }] } },
    })
    axios.patch.mockResolvedValueOnce({ data: {} })
    await userEvent.click(screen.getByText('View details'))
    expect(router.push).toHaveBeenCalledWith('/workspace/interviews/on-going/i9')
    await waitFor(() => expect(store.getState().notifications.allNotifications[0].isRead).toBe(true))
  })

  it('routes to /workspace for new job applications', async () => {
    renderWithProviders(<NotificationCard notification={{ ...base, type: 'new.job.application', isRead: true }} />)
    await userEvent.click(screen.getByText('View details'))
    expect(router.push).toHaveBeenCalledWith('/workspace')
  })

  it('has no link for success/info/warning', () => {
    for (const type of ['success', 'info', 'warning']) {
      const { unmount } = renderWithProviders(<NotificationCard notification={{ ...base, type }} />)
      expect(screen.queryByText('View details')).not.toBeInTheDocument()
      unmount()
    }
  })
})
