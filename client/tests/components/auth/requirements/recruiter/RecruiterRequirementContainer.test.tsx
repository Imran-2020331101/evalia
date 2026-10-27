// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import RecruiterRequirementContainer from '@/components/auth/requirements/recruiter/RecruiterRequirementContainer'

vi.mock('@/components/auth/requirements/recruiter/RecruiterForm', () => ({ default: ({ onSignUp }: any) => <div>org-form-{String(onSignUp)}</div> }))
afterEach(() => vi.useRealTimers())

it('mounts the organization form and animates in', () => {
  vi.useFakeTimers()
  const { container } = render(<RecruiterRequirementContainer />)
  expect(screen.getByText('org-form-true')).toBeInTheDocument()
  const wrapper = container.firstChild as HTMLElement
  expect(wrapper.style.transform).toBe('scaleX(0)')
  act(() => { vi.advanceTimersByTime(60) })
  expect(wrapper.style.transform).toBe('scaleX(1)')
})
