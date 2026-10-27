// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from '@/tests/helpers/axiosMock'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'
vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))
import ExploreContainer from '@/components/workspace/candidates/courses/explore/ExploreContainer'

describe('ExploreContainer (courses)', () => {
  it('empty state + fetches courses and saved courses', async () => {
    axios.get.mockClear()
    axios.get.mockResolvedValueOnce({ data: { data: { courses: [] } } })
    renderWithProviders(<ExploreContainer />)
    expect(await screen.findByText('No Courses Available')).toBeInTheDocument()
    expect(axios.get).toHaveBeenCalledTimes(2)
  })
  it('lists courses', () => {
    renderWithProviders(<ExploreContainer />, { preloadedState: { course: { allCourses: [{ videoId: 'a', title: 'Alpha' }], savedCourses: [{ videoId: 'z' }] } } })
    expect(screen.getByText('Alpha')).toBeInTheDocument()
  })
  it('pending and error', async () => {
    const { container, unmount } = renderWithProviders(<ExploreContainer />, { preloadedState: { course: { allCourseStatus: 'pending' } } })
    expect(container.querySelector('span span')).toBeInTheDocument()
    unmount()
    renderWithProviders(<ExploreContainer />, { preloadedState: { course: { allCourseStatus: 'error' } } })
    expect(await screen.findByText('Something went wrong')).toBeInTheDocument()
  })
})
