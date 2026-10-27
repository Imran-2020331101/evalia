// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBar from '@/components/resume/SearchBar'

const f: any = { jobDescription: '' }

describe('SearchBar', () => {
  it('disables search when empty or loading', () => {
    const { rerender } = render(<SearchBar filters={f} setFilters={vi.fn()} loading={false} onSearch={vi.fn()} />)
    expect(screen.getByTitle('Search for candidates')).toBeDisabled()
    expect(screen.getByText('0/500')).toBeInTheDocument()
    rerender(<SearchBar filters={{ ...f, jobDescription: 'dev' }} setFilters={vi.fn()} loading onSearch={vi.fn()} />)
    expect(screen.getByTitle('AI is analyzing candidates...')).toBeDisabled()
  })
  it('searches and edits text', async () => {
    const onSearch = vi.fn(), setFilters = vi.fn()
    render(<SearchBar filters={{ ...f, jobDescription: 'dev' }} setFilters={setFilters} loading={false} onSearch={onSearch} />)
    await userEvent.click(screen.getByTitle('Search for candidates'))
    expect(onSearch).toHaveBeenCalled()
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'devx' } })
    expect(setFilters).toHaveBeenCalledTimes(1)
    expect(setFilters.mock.calls[0][0]({ other: 1 })).toHaveProperty('other', 1)
  })
  it('fills in suggestions', async () => {
    const setFilters = vi.fn()
    render(<SearchBar filters={f} setFilters={setFilters} loading={false} onSearch={vi.fn()} />)
    await userEvent.click(screen.getByText('Senior React developer with AWS experience'))
    expect(setFilters.mock.calls[0][0]({})).toEqual({ jobDescription: 'Senior React developer with AWS experience' })
  })
})
