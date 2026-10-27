// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { router, resetNav } from '../../helpers/navMock'

vi.mock('nprogress', () => ({ default: { start: vi.fn(), done: vi.fn() } }))

import NProgress from 'nprogress'
import { useProgressRouter } from '@/custom-hooks/useProgressRouter'

beforeEach(() => {
  resetNav()
  vi.mocked(NProgress.start).mockClear()
  vi.mocked(NProgress.done).mockClear()
})

describe('useProgressRouter', () => {
  it('push starts progress, navigates, then finishes', async () => {
    const order: string[] = []
    vi.mocked(NProgress.start).mockImplementation((() => order.push('start')) as any)
    router.push.mockImplementation(() => { order.push('push') })
    vi.mocked(NProgress.done).mockImplementation((() => order.push('done')) as any)
    const { result } = renderHook(() => useProgressRouter())
    await act(async () => { await result.current.push('/x') })
    expect(router.push).toHaveBeenCalledWith('/x')
    expect(order).toEqual(['start', 'push', 'done'])
  })

  it('replace starts progress, navigates, then finishes', async () => {
    const { result } = renderHook(() => useProgressRouter())
    await act(async () => { await result.current.replace('/y') })
    expect(router.replace).toHaveBeenCalledWith('/y')
    expect(NProgress.start).toHaveBeenCalledTimes(1)
    expect(NProgress.done).toHaveBeenCalledTimes(1)
  })

  it('awaits a promise-returning router.push', async () => {
    let resolve!: () => void
    router.push.mockReturnValue(new Promise<void>((r) => (resolve = r)))
    const { result } = renderHook(() => useProgressRouter())
    let p!: Promise<void>
    act(() => { p = result.current.push('/z') })
    expect(NProgress.done).not.toHaveBeenCalled()
    await act(async () => { resolve(); await p })
    expect(NProgress.done).toHaveBeenCalledTimes(1)
  })

  it('finishes progress even if push throws', async () => {
    router.push.mockImplementation(() => { throw new Error('nav fail') })
    router.replace.mockImplementation(() => { throw new Error('nav fail') })
    const { result } = renderHook(() => useProgressRouter())
    await expect(result.current.push('/a')).rejects.toThrow('nav fail')
    await expect(result.current.replace('/a')).rejects.toThrow('nav fail')
    expect(NProgress.done).toHaveBeenCalledTimes(2)
  })
})
