// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PreviewCreatedJob from '@/components/workspace/recruiters/jobs/create/PreviewCreatedJob'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

const basic = { title: '', jobDescription: '', jobLocation: '', salaryFrom: 1, salaryTo: 2, deadline: '', jobType: '', employmentLevelType: '', workPlaceType: '' } as any
const filled = { ...basic, title: 'SRE', jobDescription: 'Run prod', deadline: '2030-01-01', jobType: 'Full', employmentLevelType: 'Mid', workPlaceType: 'Remote' }
const dom = [{ category: 'Cat', description: 'Desc' }] as any
const orgState = { auth: { organizations: [{ id: 'o1', organizationName: 'Acme', businessDescription: 'Cloud', organizationProfileImageUrl: 'http://img/a.png' }] }, job: { selectedOrgId: 'o1' } }

describe('PreviewCreatedJob', () => {
  it('shows placeholders for empty input', () => {
    renderWithProviders(<PreviewCreatedJob requirement={[]} responsibilities={[]} skills={[]} interviewQA={[]} basicState={basic} />)
    expect(screen.getByText(/Job title will appear here/)).toBeInTheDocument()
    expect(screen.getByText(/Description will appear here/)).toBeInTheDocument()
    expect(screen.getByText(/Requirements will appear here/)).toBeInTheDocument()
    expect(screen.getByText(/Responsibilities will appear here/)).toBeInTheDocument()
    expect(screen.getByText(/Preferred Skills will appear here/)).toBeInTheDocument()
    expect(screen.getByText(/Questions will appear here/)).toBeInTheDocument()
  })

  it('renders filled values and organization', () => {
    renderWithProviders(<PreviewCreatedJob requirement={dom} responsibilities={dom} skills={dom} interviewQA={[{ question: 'Why?', referenceAnswer: 'Because' }, { question: 'No ref' }] as any} basicState={filled} />, { preloadedState: orgState })
    expect(screen.getByText('SRE')).toBeInTheDocument()
    expect(screen.getByText('Run prod')).toBeInTheDocument()
    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.getByText('$1k - $2k')).toBeInTheDocument()
    expect(screen.getByText('2030-01-01')).toBeInTheDocument()
    expect(screen.getAllByText('Desc')).toHaveLength(3)
    expect(screen.getByText('Why?', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('Because', { exact: false })).toBeInTheDocument()
    expect(screen.getAllByText(/Reference Answer/, { selector: 'span' })).toHaveLength(1)
  })

  it('switches between job preview and interview questions', async () => {
    const { container } = renderWithProviders(<PreviewCreatedJob requirement={[]} responsibilities={[]} skills={[]} interviewQA={[]} basicState={basic} />)
    const sections = container.querySelectorAll('section.w-full.h-full')
    expect(sections[0].className).toContain('flex')
    await userEvent.click(screen.getByRole('button', { name: 'Interview Questions' }))
    expect(screen.getByRole('button', { name: 'Interview Questions' })).toHaveClass('text-blue-500')
    await userEvent.click(screen.getByRole('button', { name: 'Job Preview' }))
    expect(screen.getByRole('button', { name: 'Job Preview' })).toHaveClass('text-blue-500')
  })
})
