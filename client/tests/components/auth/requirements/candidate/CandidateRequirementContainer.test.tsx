// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import CandidateRequirementContainer from '@/components/auth/requirements/candidate/CandidateRequirementContainer'

vi.mock('@/components/auth/requirements/candidate/UploadResume', () => ({ default: ({ onSignUp }: any) => <div>upload-{String(onSignUp)}</div> }))
afterEach(() => vi.useRealTimers())

it('mounts the upload step and animates in', () => {
  vi.useFakeTimers()
  const { container } = render(<CandidateRequirementContainer />)
  expect(screen.getByText('upload-true')).toBeInTheDocument()
  const wrapper = container.firstChild as HTMLElement
  expect(wrapper.style.opacity).toBe('0.6')
  act(() => { vi.advanceTimersByTime(60) })
  expect(wrapper.style.opacity).toBe('1')
  expect(wrapper.style.transform).toBe('scaleX(1)')
})
