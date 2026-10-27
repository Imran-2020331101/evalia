// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotificationContainer from '@/components/workspace/notifications/NotificationContainer'
import { renderWithProviders } from '../../../helpers/renderWithProviders'
import axios from '@/tests/helpers/axiosMock'

vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))

describe('NotificationContainer', () => {
  it('shows the empty state and fetches notifications', () => {
    renderWithProviders(<NotificationContainer />)
    expect(screen.getByText('No Notifications Yet')).toBeInTheDocument()
    expect(axios.get).toHaveBeenCalled()
  })

  it('renders a card per notification', () => {
    renderWithProviders(<NotificationContainer />, {
      preloadedState: { notifications: { allNotifications: [
        { _id: 'a', title: 'First', message: 'm1', type: 'info', createdAt: '2024-01-01' },
        { _id: 'b', title: 'Second', message: 'm2', type: 'info', createdAt: '2024-01-02' },
      ] } },
    })
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
    expect(screen.queryByText('No Notifications Yet')).not.toBeInTheDocument()
  })

  it('mark all read dispatches the request', async () => {
    axios.get.mockClear(); axios.patch.mockClear(); axios.post.mockClear(); axios.put.mockClear()
    renderWithProviders(<NotificationContainer />, { preloadedState: { notifications: { allNotifications: [{ _id: 'a', title: 'x', message: 'y', type: 'info', createdAt: '2024-01-01' }] } } })
    await userEvent.click(screen.getByRole('button', { name: /Mark All Read/ }))
    expect(axios.patch.mock.calls.length + axios.post.mock.calls.length + axios.put.mock.calls.length).toBe(1)
  })

  it('shows a loader overlay while marking all read', () => {
    const { container } = renderWithProviders(<NotificationContainer />, { preloadedState: { notifications: { markAllReadNotificationStatus: 'pending' } } })
    expect(container.querySelector('.bg-black\\/30')).toBeInTheDocument()
  })
})
