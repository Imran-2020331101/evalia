// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MediaHandler from '@/components/interview/MediaHandler'

let recorders: any[]
let volume = 128
beforeEach(() => {
  recorders = []
  volume = 128
  const getUserMedia = vi.fn().mockResolvedValue({ getTracks: () => [] })
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia } })
  ;(globalThis as any).MediaRecorder = class {
    ondataavailable: any; onstop: any
    start = vi.fn(); stop = vi.fn(() => this.onstop?.())
    constructor() { recorders.push(this) }
  }
  ;(globalThis as any).AudioContext = class {
    createAnalyser() { return { fftSize: 8, getByteTimeDomainData: (a: Uint8Array) => a.fill(volume) } }
    createMediaStreamSource() { return { connect: vi.fn() } }
  }
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined) as any
  vi.spyOn(console, 'log').mockImplementation(() => {})
})
afterEach(() => vi.useRealTimers())

describe('MediaHandler', () => {
  it('shows start button, then records after click', async () => {
    render(<MediaHandler />)
    await userEvent.click(screen.getByRole('button', { name: /Start Interview/ }))
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(2)
    expect(recorders).toHaveLength(2)
    expect(recorders[0].start).toHaveBeenCalled()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('stops after 5s without speech', async () => {
    vi.useFakeTimers()
    render(<MediaHandler />)
    await act(async () => { screen.getByRole('button').click() })
    await act(async () => { vi.advanceTimersByTime(5000) })
    expect(recorders[0].stop).toHaveBeenCalled()
    expect(recorders[1].stop).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /Start Interview/ })).toBeInTheDocument()
  })

  it('detects voice then stops after 3s of silence', async () => {
    vi.useFakeTimers()
    render(<MediaHandler />)
    await act(async () => { screen.getByRole('button').click() })
    volume = 200
    await act(async () => { vi.advanceTimersByTime(300) })
    volume = 128
    await act(async () => { vi.advanceTimersByTime(3100) })
    expect(recorders[0].stop).toHaveBeenCalled()
  })
})
