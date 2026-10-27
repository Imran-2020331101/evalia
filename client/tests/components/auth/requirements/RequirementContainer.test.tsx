// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import RequirementContainer from '@/components/auth/requirements/RequirementContainer'

vi.mock('@/components/auth/requirements/RoleSelection', () => ({
  default: ({ userType, setIsNext }: any) => (
    <div>
      role-selection-{String(userType)}
      <button onClick={() => setIsNext(true)}>next</button>
    </div>
  ),
}))
vi.mock('@/components/auth/requirements/candidate/CandidateRequirementContainer', () => ({ default: () => <div>candidate-flow</div> }))
vi.mock('@/components/auth/requirements/recruiter/RecruiterRequirementContainer', () => ({ default: () => <div>recruiter-flow</div> }))

import userEvent from '@testing-library/user-event'

describe('RequirementContainer', () => {
  it('starts on role selection', () => {
    render(<RequirementContainer userType={null} setUserType={vi.fn()} />)
    expect(screen.getByText('role-selection-null')).toBeInTheDocument()
  })
  it('moves to the candidate flow', async () => {
    render(<RequirementContainer userType="candidate" setUserType={vi.fn()} />)
    await userEvent.click(screen.getByText('next'))
    expect(screen.getByText('candidate-flow')).toBeInTheDocument()
  })
  it('moves to the recruiter flow', async () => {
    render(<RequirementContainer userType="recruiter" setUserType={vi.fn()} />)
    await userEvent.click(screen.getByText('next'))
    expect(screen.getByText('recruiter-flow')).toBeInTheDocument()
  })
  it('renders nothing after next when no type is chosen', async () => {
    render(<RequirementContainer userType={null} setUserType={vi.fn()} />)
    await userEvent.click(screen.getByText('next'))
    expect(screen.queryByText(/flow|role-selection/)).not.toBeInTheDocument()
  })
})
