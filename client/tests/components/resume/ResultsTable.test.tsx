// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ResultsTable from '@/components/resume/ResultsTable'

const cand = (id: string, total: number, extra: any = {}) => ({
  id, name: `Name ${id}`, email: `${id}@x.com`,
  skills: { score: 85, details: ['a', 'b', 'c'] },
  experience: { score: 65, years: 4, companies: [] },
  projects: { score: 10, count: 3, projects: [] },
  education: { score: 70, degree: 'BSc', institution: 'MIT', gpa: 3.5 },
  totalScore: total, ...extra,
})
const base = { loading: false, sortBy: 'totalScore' as const, setSortBy: vi.fn(), sortOrder: 'desc' as const, onSort: vi.fn() }

describe('ResultsTable', () => {
  it('shows loading state', () => {
    render(<ResultsTable {...base} candidates={[]} loading />)
    expect(screen.getByText('Loading candidates...')).toBeInTheDocument()
  })
  it('shows empty state', () => {
    render(<ResultsTable {...base} candidates={[]} />)
    expect(screen.getByText(/No candidates found/)).toBeInTheDocument()
    expect(screen.getByText('Search Results (0 candidates)')).toBeInTheDocument()
  })
  it('renders candidate rows with details and score colors', () => {
    render(<ResultsTable {...base} candidates={[cand('1', 90), cand('2', 10, { skills: { score: 1, details: ['a'] } })]} />)
    expect(screen.getByText('Name 1')).toBeInTheDocument()
    expect(screen.getByText('a, b...')).toBeInTheDocument()
    expect(screen.getAllByText('4 years')).toHaveLength(2)
    expect(screen.getAllByText('GPA: 3.5')).toHaveLength(2)
    expect(screen.getByText('90')).toHaveClass('text-green-400')
    expect(screen.getAllByText('65', { selector: 'span' })[0].className).toMatch(/yellow/)
    expect(screen.getByText('10', { selector: '.font-bold' }).className).toMatch(/red/)
  })
  it('sorts via headers and select, showing arrow', async () => {
    const onSort = vi.fn(), setSortBy = vi.fn()
    const { rerender } = render(<ResultsTable {...base} onSort={onSort} setSortBy={setSortBy} candidates={[]} />)
    expect(screen.getByRole('columnheader', { name: /Total Score ↓/ })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('columnheader', { name: /Skills Score/ }))
    expect(onSort).toHaveBeenCalledWith('skills')
    await userEvent.selectOptions(screen.getByRole('combobox'), 'projects')
    expect(setSortBy).toHaveBeenCalledWith('projects')
    rerender(<ResultsTable {...base} sortBy="skills" sortOrder="asc" candidates={[]} />)
    expect(screen.getByRole('columnheader', { name: /Skills Score ↑/ })).toBeInTheDocument()
  })
})
