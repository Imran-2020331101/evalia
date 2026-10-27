// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useDeepCompareEffect } from '@/custom-hooks/useDeepCompareEffect'

describe('useDeepCompareEffect', () => {
  it('runs the effect on mount', () => {
    const effect = vi.fn()
    renderHook(() => useDeepCompareEffect(effect, [{ a: 1 }]))
    expect(effect).toHaveBeenCalledTimes(1)
  })

  it('does not re-run when deps are deeply equal but new references', () => {
    const effect = vi.fn()
    const { rerender } = renderHook(({ dep }) => useDeepCompareEffect(effect, [dep]), { initialProps: { dep: { a: [1, 2], b: { c: 3 } } } })
    rerender({ dep: { a: [1, 2], b: { c: 3 } } })
    rerender({ dep: { a: [1, 2], b: { c: 3 } } })
    expect(effect).toHaveBeenCalledTimes(1)
  })

  it('re-runs when a nested value changes', () => {
    const effect = vi.fn()
    const { rerender } = renderHook(({ dep }) => useDeepCompareEffect(effect, [dep]), { initialProps: { dep: { a: { b: 1 } } } })
    rerender({ dep: { a: { b: 2 } } })
    expect(effect).toHaveBeenCalledTimes(2)
  })

  it('runs cleanup before re-running and on unmount', () => {
    const cleanup = vi.fn()
    const effect = vi.fn(() => cleanup)
    const { rerender, unmount } = renderHook(({ dep }) => useDeepCompareEffect(effect, [dep]), { initialProps: { dep: 1 } })
    rerender({ dep: 2 })
    expect(cleanup).toHaveBeenCalledTimes(1)
    unmount()
    expect(cleanup).toHaveBeenCalledTimes(2)
  })

  it('handles multiple deps independently', () => {
    const effect = vi.fn()
    const { rerender } = renderHook(({ a, b }) => useDeepCompareEffect(effect, [a, b]), { initialProps: { a: { x: 1 }, b: [1] } })
    rerender({ a: { x: 1 }, b: [1] })
    expect(effect).toHaveBeenCalledTimes(1)
    rerender({ a: { x: 1 }, b: [2] })
    expect(effect).toHaveBeenCalledTimes(2)
  })
})
