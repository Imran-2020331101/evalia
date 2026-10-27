// @vitest-environment jsdom
import { expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

vi.mock('@/components/auth/ImageSlider', () => ({ default: () => <div data-testid="slider" /> }))
vi.mock('@/components/auth/requirements/RequirementContainer', () => ({
  default: ({ userType, setUserType }: any) => (
    <button data-testid="req" onClick={() => setUserType('recruiter')}>{String(userType)}</button>
  ),
}))
import Layout from '@/app/auth/layout'
import userEvent from '@testing-library/user-event'

it('renders brand, slider, children and a hidden role overlay by default', () => {
  renderWithProviders(<Layout><p>form</p></Layout>)
  expect(screen.getByText('EVALIA')).toBeInTheDocument()
  expect(screen.getByTestId('slider')).toBeInTheDocument()
  expect(screen.getByText('form')).toBeInTheDocument()
  expect(screen.getByTestId('req').closest('.hidden')).not.toBeNull()
})

it('shows the role overlay when the store flag is set and lets it change userType', async () => {
  renderWithProviders(<Layout><p>form</p></Layout>, { preloadedState: { utils: { isShowAuthRole: true } } })
  expect(screen.getByTestId('req').closest('.hidden')).toBeNull()
  expect(screen.getByTestId('req')).toHaveTextContent('null')
  await userEvent.click(screen.getByTestId('req'))
  expect(screen.getByTestId('req')).toHaveTextContent('recruiter')
})
