// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchFilters from '@/components/resume/SearchFilters'

const filters = { institution: '', degree: '', minGPA: 0, minExperience: 0, industry: '', skills: '', projects: '', jobDescription: '' }
const weights = { skills: 40, experience: 30, projects: 20, education: 10 }
function setup() {
  const p = { onTopKChange: vi.fn(), onFiltersChange: vi.fn(), onWeightsChange: vi.fn(), onSearch: vi.fn(), onClearFilters: vi.fn() }
  render(<SearchFilters filters={filters} weights={weights} topK={10} loading={false} {...p} />)
  return p
}

describe('SearchFilters', () => {
  it('fires buttons', async () => {
    const p = setup()
    await userEvent.click(screen.getByText('Clear All'))
    await userEvent.click(screen.getByText('Advanced Search'))
    expect(p.onClearFilters).toHaveBeenCalled()
    expect(p.onSearch).toHaveBeenCalled()
  })
  it('emits filter changes', async () => {
    const p = setup()
    await userEvent.type(screen.getByPlaceholderText('Enter institution name...'), 'M')
    expect(p.onFiltersChange).toHaveBeenLastCalledWith({ ...filters, institution: 'M' })
    await userEvent.selectOptions(screen.getByDisplayValue('All Industries'), 'Finance')
    expect(p.onFiltersChange).toHaveBeenLastCalledWith({ ...filters, industry: 'Finance' })
    await userEvent.selectOptions(screen.getByDisplayValue('All Degrees'), 'PhD')
    expect(p.onFiltersChange).toHaveBeenLastCalledWith({ ...filters, degree: 'PhD' })
    await userEvent.type(screen.getByPlaceholderText(/Enter skills/), 'r')
    expect(p.onFiltersChange).toHaveBeenLastCalledWith({ ...filters, skills: 'r' })
    await userEvent.type(screen.getByPlaceholderText('Enter project keywords...'), 'p')
    expect(p.onFiltersChange).toHaveBeenLastCalledWith({ ...filters, projects: 'p' })
    await userEvent.type(screen.getByPlaceholderText(/Paste job/), 'j')
    expect(p.onFiltersChange).toHaveBeenLastCalledWith({ ...filters, jobDescription: 'j' })
    fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '5' } })
    expect(p.onFiltersChange).toHaveBeenLastCalledWith({ ...filters, minExperience: 5 })
    fireEvent.change(screen.getByPlaceholderText('0.0'), { target: { value: '3.2' } })
    expect(p.onFiltersChange).toHaveBeenLastCalledWith({ ...filters, minGPA: 3.2 })
    fireEvent.change(screen.getByPlaceholderText('0.0'), { target: { value: '' } })
    expect(p.onFiltersChange).toHaveBeenLastCalledWith({ ...filters, minGPA: 0 })
  })
  it('emits topK (default 10 on NaN) and weights', () => {
    const p = setup()
    fireEvent.change(screen.getByPlaceholderText('10'), { target: { value: '25' } })
    expect(p.onTopKChange).toHaveBeenLastCalledWith(25)
    fireEvent.change(screen.getByPlaceholderText('10'), { target: { value: '' } })
    expect(p.onTopKChange).toHaveBeenLastCalledWith(10)
    expect(screen.getByText('Skills Match (40%)')).toBeInTheDocument()
    const ranges = screen.getAllByRole('slider')
    ;(['skills', 'experience', 'projects', 'education'] as const).forEach((k, i) => {
      fireEvent.change(ranges[i], { target: { value: '55' } })
      expect(p.onWeightsChange).toHaveBeenLastCalledWith({ ...weights, [k]: 55 })
    })
  })
})
