// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from '@/tests/helpers/axiosMock'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'
vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))
import SavedContainer from '@/components/workspace/candidates/courses/saved/SavedContainer'

describe('SavedContainer (courses)', () => {
  it('empty state + fetch', async () => {
    axios.get.mockResolvedValueOnce({ data: { data: [{ savedCourses: [] }] } })
    renderWithProviders(<SavedContainer />)
    expect(await screen.findByText('No Courses Available')).toBeInTheDocument()
    expect(axios.get).toHaveBeenCalled()
  })
  it('lists saved courses', () => {
    renderWithProviders(<SavedContainer />, { preloadedState: { course: { savedCourses: [{ videoId: 'a', title: 'Alpha' }, { videoId: 'b', title: 'Beta' }] } } })
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })
  it('pending and error', async () => {
    const { container, unmount } = renderWithProviders(<SavedContainer />, { preloadedState: { course: { getAllSaveCourseStatus: 'pending' } } })
    expect(container.querySelector('span span')).toBeInTheDocument()
    unmount()
    renderWithProviders(<SavedContainer />, { preloadedState: { course: { getAllSaveCourseStatus: 'error' } } })
    expect(await screen.findByText('Something went wrong')).toBeInTheDocument()
  })
})
