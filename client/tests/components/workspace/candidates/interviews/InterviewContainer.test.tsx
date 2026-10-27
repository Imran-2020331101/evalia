// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from '@/tests/helpers/axiosMock'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'
vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))
import InterviewContainer from '@/components/workspace/candidates/interviews/InterviewContainer'

describe('InterviewContainer', () => {
  it('renders a card per interview', async () => {
    axios.get.mockResolvedValue({ data: { organizationName: 'Acme' } })
    renderWithProviders(<InterviewContainer interviews={[{ _id: '1', id: '1', jobTitle: 'A', interviewStatus: 'SCHEDULED', organizationId: 'o' }, { _id: '2', id: '2', jobTitle: 'B', interviewStatus: 'COMPLETED', organizationId: 'o' }]} />)
    expect(await screen.findByText('A')).toBeInTheDocument()
    expect(await screen.findByText('B')).toBeInTheDocument()
  })
  it('renders empty list', () => {
    const { container } = renderWithProviders(<InterviewContainer interviews={[]} />)
    expect(container.querySelector('.overflow-y-auto')).toBeEmptyDOMElement()
  })
})
