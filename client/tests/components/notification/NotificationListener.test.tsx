// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'

const handlers: Record<string, (...a: any[]) => void> = {}
const socket = { on: vi.fn((e: string, cb: any) => { handlers[e] = cb }), disconnect: vi.fn() }
const io = vi.fn(() => socket)
vi.mock('socket.io-client', () => ({ io: (...a: any[]) => (io as any)(...a) }))
const toast = { success: vi.fn() }
vi.mock('sonner', () => ({ toast: { success: (...a: any[]) => toast.success(...a) } }))

import { renderWithProviders } from '../../helpers/renderWithProviders'

beforeEach(() => { vi.clearAllMocks(); vi.spyOn(console, 'log').mockImplementation(() => {}); vi.spyOn(console, 'error').mockImplementation(() => {}) })
afterEach(() => { vi.resetModules(); vi.doUnmock('@/lib/demo/config') })

describe('NotificationListener', () => {
  it('connects, toasts and stores notifications, disconnects on unmount', async () => {
    const { default: NotificationListener } = await import('@/components/notification/NotificationListener')
    const { store, container, unmount } = renderWithProviders(<NotificationListener />)
    expect(container).toBeEmptyDOMElement()
    expect(io).toHaveBeenCalledWith('http://localhost:6001', { withCredentials: true })
    handlers.connect()
    handlers.connect_error(new Error('x'))
    const { act } = await import('@testing-library/react')
    act(() => handlers.notification({ _id: 'n1', title: 'Hello', isRead: false }))
    expect(toast.success).toHaveBeenCalledWith('Hello')
    expect(JSON.stringify(store.getState().notifications)).toContain('Hello')
    handlers.interview({ title: 'Interview!' })
    expect(toast.success).toHaveBeenCalledWith('Interview!')
    unmount()
    expect(socket.disconnect).toHaveBeenCalled()
  })

  it('does nothing in demo mode', async () => {
    vi.doMock('@/lib/demo/config', () => ({ DEMO: true }))
    const { default: NotificationListener } = await import('@/components/notification/NotificationListener')
    renderWithProviders(<NotificationListener />)
    expect(io).not.toHaveBeenCalled()
  })
})
