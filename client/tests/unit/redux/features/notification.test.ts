import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import reducer, * as s from '@/redux/features/notification'
import { createMockStore } from '../../../helpers/mockStore'
import { runThunkCase, silenceConsole } from '../../../helpers/thunkHarness'

vi.mock('axios', () => ({ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }))

beforeEach(silenceConsole)
afterEach(() => vi.restoreAllMocks())

const B = 'http://localhost:8080/api/notifications'

describe('notification thunks', () => {
  const cases = [
    { name: 'getAll', thunk: s.getAllNotifications, method: 'get', url: `${B}/`, data: { data: [] }, fallback: 'failed fetching notifications' },
    { name: 'markAsRead', thunk: s.markAsRead, arg: 'n9', method: 'patch', url: `${B}/n9/read`, body: null, data: { ok: 1 }, payload: 'n9', fallback: 'failed marked as read notification' },
    { name: 'markAllRead', thunk: s.markAllRead, method: 'patch', url: `${B}/read-all`, body: null, data: { ok: 1 }, fallback: 'failed marked all as read notification' },
  ] as const
  for (const c of cases) {
    const h = runThunkCase(axios, c as any)
    it(`${c.name} success`, h.success)
    it(`${c.name} server error`, h.serverError)
    it(`${c.name} network error`, h.networkError)
  }
})

describe('notification reducer', () => {
  it('addNotification pushes', () => {
    const st = reducer(undefined, s.addNotification({ _id: '1' }))
    expect(st.allNotifications).toEqual([{ _id: '1' }])
    expect(st.unreadNOtifications).toBeNull()
  })
  it('getAll lifecycle', async () => {
    const store = createMockStore()
    ;(axios.get as any).mockResolvedValueOnce({ data: { data: [{ _id: 'a', isRead: false }] } })
    const p = store.dispatch(s.getAllNotifications() as any)
    expect(store.getState().notifications.getAllNotificationStatus).toBe('pending')
    await p
    expect(store.getState().notifications.getAllNotificationStatus).toBe('success')
    expect(s.allNotifications(store.getState())).toEqual([{ _id: 'a', isRead: false }])
    ;(axios.get as any).mockRejectedValueOnce(new Error('x'))
    await store.dispatch(s.getAllNotifications() as any)
    expect(store.getState().notifications.getAllNotificationStatus).toBe('error')
  })
  it('markAllRead lifecycle', async () => {
    const store = createMockStore({ notifications: { allNotifications: [{ _id: 'a', isRead: false }, { _id: 'b', isRead: false }] } })
    ;(axios.patch as any).mockResolvedValueOnce({ data: {} })
    const p = store.dispatch(s.markAllRead() as any)
    expect(s.markAllReadNotificationStatus(store.getState())).toBe('pending')
    await p
    expect(s.markAllReadNotificationStatus(store.getState())).toBe('success')
    expect(s.allNotifications(store.getState()).every((n: any) => n.isRead)).toBe(true)
    ;(axios.patch as any).mockRejectedValueOnce(new Error('x'))
    await store.dispatch(s.markAllRead() as any)
    expect(s.markAllReadNotificationStatus(store.getState())).toBe('error')
  })
  it('markAsRead fulfilled flags only the matching item', async () => {
    const store = createMockStore({ notifications: { allNotifications: [{ _id: 'a', isRead: false }, { _id: 'b', isRead: false }] } })
    ;(axios.patch as any).mockResolvedValueOnce({ data: {} })
    await store.dispatch(s.markAsRead('a' as any) as any)
    expect(s.allNotifications(store.getState())).toEqual([{ _id: 'a', isRead: true }, { _id: 'b', isRead: false }])
    expect(s.unreadNOtifications(store.getState())).toBeNull()
  })
})
