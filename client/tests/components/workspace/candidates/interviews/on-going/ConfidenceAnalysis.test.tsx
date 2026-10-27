// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render } from '@testing-library/react'
import ConfidenceAnalysis from '@/components/workspace/candidates/interviews/on-going/ConfidenceAnalysis'
import { setNav } from '../../../../../helpers/navMock'

const socket = vi.hoisted(() => ({ emit: vi.fn(), on: vi.fn(), disconnect: vi.fn() }))
vi.mock('socket.io-client', () => ({ io: vi.fn(() => socket) }))

const track = { stop: vi.fn() }
const stream = { getTracks: () => [track] }

beforeEach(() => {
  Object.values(socket).forEach((f) => f.mockClear())
  track.stop.mockClear()
  setNav({ pathname: '/workspace/interviews/on-going/int-1' })
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: vi.fn().mockResolvedValue(stream) } })
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({ drawImage: vi.fn() })) as any
  HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:frame')
})
afterEach(() => vi.useRealTimers())

describe('ConfidenceAnalysis', () => {
  it('joins the room, streams frames and reports metrics', async () => {
    vi.useFakeTimers()
    const setPerf = vi.fn()
    const { container } = render(<ConfidenceAnalysis setOverallPerformance={setPerf} isEndEvaluation={false} />)
    expect(container.querySelector('video')).toBeInTheDocument()
    expect(socket.emit).toHaveBeenCalledWith('join-room', 'int-1')
    await act(async () => { await Promise.resolve() })
    act(() => { vi.advanceTimersByTime(2000) })
    expect(socket.emit).toHaveBeenCalledWith('video-frames', { interviewId: 'int-1', frame: 'data:frame' })
    const metricsCb = socket.on.mock.calls.find((c) => c[0] === 'metrics')![1]
    metricsCb({ smoothedScore: '0.756' })
    expect(setPerf).toHaveBeenCalledWith(75)
  })

  it('stops devices and disconnects on unmount', async () => {
    const { unmount } = render(<ConfidenceAnalysis setOverallPerformance={vi.fn()} isEndEvaluation={false} />)
    await act(async () => { await Promise.resolve() })
    unmount()
    expect(socket.disconnect).toHaveBeenCalled()
    expect(track.stop).toHaveBeenCalled()
  })

  it('tears down when the evaluation ends', async () => {
    const { rerender } = render(<ConfidenceAnalysis setOverallPerformance={vi.fn()} isEndEvaluation={false} />)
    await act(async () => { await Promise.resolve() })
    rerender(<ConfidenceAnalysis setOverallPerformance={vi.fn()} isEndEvaluation={true} />)
    expect(socket.emit).toHaveBeenCalledWith('disconnection', 'int-1')
    expect(track.stop).toHaveBeenCalled()
  })

  it('survives a getUserMedia failure', async () => {
    ;(navigator.mediaDevices.getUserMedia as any).mockRejectedValue(new Error('denied'))
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ConfidenceAnalysis setOverallPerformance={vi.fn()} isEndEvaluation={false} />)
    await act(async () => { await Promise.resolve() })
    expect(spy).toHaveBeenCalled()
  })
})
