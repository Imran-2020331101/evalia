// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import MenuContainer from '@/components/workspace/menu/MenuContainer'
import { renderWithProviders } from '../../../helpers/renderWithProviders'

vi.mock('@/components/workspace/menu/RecruitersWorkSpaceMenu', () => ({ default: () => <div>recruiter-menu</div> }))
vi.mock('@/components/workspace/menu/CandidatesWorkSpaceMenu', () => ({ default: () => <div>candidate-menu</div> }))

describe('MenuContainer', () => {
  it('shows the recruiter menu for RECRUITER', () => {
    const { getByText } = renderWithProviders(<MenuContainer />, { preloadedState: { auth: { user: { user: { roles: ['RECRUITER'] } } } } })
    expect(getByText('recruiter-menu')).toBeInTheDocument()
  })
  it('shows the candidate menu for USER', () => {
    const { getByText } = renderWithProviders(<MenuContainer />, { preloadedState: { auth: { user: { user: { roles: ['USER'] } } } } })
    expect(getByText('candidate-menu')).toBeInTheDocument()
  })
  it('renders nothing inside when there is no user', () => {
    const { container } = renderWithProviders(<MenuContainer />)
    expect(container.querySelector('section')).toBeEmptyDOMElement()
  })
})
