// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import MyJobsSingle from '@/components/workspace/recruiters/jobs/my-jobs/MyJobsSingle'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

const job = {
  title: 'SRE', jobDescription: 'Keep it up', employmentLevel: 'Mid', deadline: '2030-01-01T00:00:00Z', jobType: 'Full', workPlaceType: 'Remote',
  salary: { from: 2, to: 4 }, company: { OrganizationId: 'o1' },
  requirements: [{ category: 'Exp', description: '3y' }], responsibilities: [{ category: 'Ops', description: 'On-call' }], skills: [{ category: 'Tool', description: 'k8s' }],
}
const orgs = [{ id: 'o1', organizationName: 'Acme', businessDescription: 'Cloud', organizationProfileImageUrl: 'http://img/a.png' }]

describe('MyJobsSingle', () => {
  it('renders all job sections and org info', () => {
    renderWithProviders(<MyJobsSingle job={job} />, { preloadedState: { auth: { organizations: orgs } } })
    expect(screen.getByText('SRE')).toBeInTheDocument()
    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.getByText('Cloud')).toBeInTheDocument()
    expect(screen.getByText('2$ - 4$')).toBeInTheDocument()
    expect(screen.getByText('Keep it up')).toBeInTheDocument()
    expect(screen.getByText('3y')).toBeInTheDocument()
    expect(screen.getByText('On-call')).toBeInTheDocument()
    expect(screen.getByText('k8s')).toBeInTheDocument()
    expect(screen.getByText(new Date(job.deadline).toLocaleDateString())).toBeInTheDocument()
  })

  it('tolerates a missing organization', () => {
    renderWithProviders(<MyJobsSingle job={{ ...job, deadline: undefined }} />, { preloadedState: { auth: { organizations: [] } } })
    expect(screen.getByText('SRE')).toBeInTheDocument()
    expect(screen.queryByText('Acme')).not.toBeInTheDocument()
  })
})
