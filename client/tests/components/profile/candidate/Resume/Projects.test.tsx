// @vitest-environment jsdom
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Projects from '@/components/profile/candidate/Resume/Projects'

const data = [{ title: 'Proj', description: 'does stuff', technologies: ['React', ' '], url: 'http://p.io' }]
const Host = ({ initial = data as any[] }) => {
  const [v, setV] = useState<any[]>(initial)
  return <Projects editedProjects={v} setProjects={setV} />
}

describe('Projects', () => {
  it('renders projects with tech and link', () => {
    render(<Host />)
    expect(screen.getByText('Proj')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /View Project/ })).toHaveAttribute('href', 'http://p.io')
  })
  it('omits link and tech when absent', () => {
    render(<Host initial={[{ title: 'P', description: 'd' }]} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
  it('edits, adds tech/project, removes and saves with cleaning', async () => {
    render(<Host />)
    await userEvent.click(within(screen.getByRole('heading', { name: /Projects/ })).getByRole('button'))
    expect(screen.getByText('Edit Projects')).toBeInTheDocument()
    await userEvent.type(screen.getByPlaceholderText('Project Title'), '2')
    await userEvent.type(screen.getByPlaceholderText(/Short description/), '!')
    await userEvent.type(screen.getByDisplayValue('React'), 'X')
    await userEvent.click(screen.getByText('Add Technology'))
    await userEvent.type(screen.getByPlaceholderText('https://your-project.com'), '/a')
    await userEvent.click(screen.getByText('Add New Project'))
    expect(screen.getAllByPlaceholderText('Project Title')).toHaveLength(2)
    const x = screen.getAllByRole('button').filter((b) => b.className.includes('red'))
    await userEvent.click(x[x.length - 1])
    await userEvent.click(screen.getByText('Save Changes'))
    expect(screen.getByText('Proj2')).toBeInTheDocument()
    expect(screen.getByText('ReactX')).toBeInTheDocument()
  })
})
