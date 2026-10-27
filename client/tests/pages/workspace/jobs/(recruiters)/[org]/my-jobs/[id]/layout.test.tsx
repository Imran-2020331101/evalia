// @vitest-environment jsdom
import { beforeEach, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import axios from 'axios'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'
import { setNav } from '@/tests/helpers/navMock'

vi.mock('axios')
vi.mock('@/components/workspace/recruiters/jobs/my-jobs/MyJobSingleNavbar', () => ({ default: () => <div data-testid="nav" /> }))
vi.mock('@/components/workspace/recruiters/jobs/my-jobs/MyJobsSingle', () => ({ default: ({ job }: any) => <div data-testid="single">{job.title}</div> }))

import Layout from '@/app/workspace/jobs/(recruiters)/[org]/my-jobs/[id]/layout'

beforeEach(() => { vi.mocked(axios.get).mockReset(); setNav({ params: { id: 'j9' } }) })

it('shows a loader, then the job and children once fetched, and stores the job', async () => {
  vi.mocked(axios.get).mockResolvedValue({ data: { data: { _id: 'j9', title: 'Dev' } } })
  const { store } = renderWithProviders(<Layout><p>kid</p></Layout>)
  expect(screen.queryByTestId('single')).not.toBeInTheDocument()
  expect(await screen.findByTestId('single')).toHaveTextContent('Dev')
  expect(screen.getByTestId('nav')).toBeInTheDocument()
  expect(screen.getByText('kid')).toBeInTheDocument()
  expect(axios.get).toHaveBeenCalledWith('http://localhost:8080/api/job/j9', { withCredentials: true })
  expect(store.getState().job.recruitersSelectedJob).toMatchObject({ _id: 'j9' })
})

it('keeps the loader when the request fails', async () => {
  vi.mocked(axios.get).mockRejectedValue(new Error('x'))
  vi.spyOn(console, 'log').mockImplementation(() => {})
  renderWithProviders(<Layout><p>kid</p></Layout>)
  await waitFor(() => expect(axios.get).toHaveBeenCalled())
  expect(screen.queryByText('kid')).not.toBeInTheDocument()
})
