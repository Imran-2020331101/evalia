// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
import { toast } from 'sonner'
import UploadResume from '@/components/profile/candidate/UploadResume'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

const pdf = (size = 2048, name = 'cv.pdf', type = 'application/pdf') => {
  const f = new File(['x'], name, { type })
  Object.defineProperty(f, 'size', { value: size })
  return f
}
const input = (c: HTMLElement) => c.querySelector('input[type=file]') as HTMLInputElement

beforeEach(() => vi.spyOn(console, 'log').mockImplementation(() => {}))
afterEach(() => vi.unstubAllGlobals())

describe('candidate UploadResume', () => {
  it('rejects non-pdf files', async () => {
    const { container } = renderWithProviders(<UploadResume setIsUploadResume={vi.fn()} />)
    fireEvent.change(input(container), { target: { files: [pdf(10, 'a.txt', 'text/plain')] } })
    expect(await screen.findByText('Please upload a PDF file only')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Try again'))
    expect(screen.queryByText('Upload Status')).not.toBeInTheDocument()
  })
  it('rejects oversized files', async () => {
    const { container } = renderWithProviders(<UploadResume setIsUploadResume={vi.fn()} />)
    fireEvent.change(input(container), { target: { files: [pdf(11 * 1024 * 1024)] } })
    expect(await screen.findByText('File size must be less than 10MB')).toBeInTheDocument()
  })
  it('uploads successfully, stores url and closes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: { downloadUrl: 'http://dl/cv.pdf' } }) }))
    const close = vi.fn()
    const { container, store } = renderWithProviders(<UploadResume setIsUploadResume={close} />, { preloadedState: { auth: { user: { user: {} } } } })
    fireEvent.change(input(container), { target: { files: [pdf()] } })
    await waitFor(() => expect(close).toHaveBeenCalledWith(false))
    expect(toast.success).toHaveBeenCalled()
    expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/resume/upload', expect.objectContaining({ method: 'POST', credentials: 'include' }))
    expect(JSON.stringify(store.getState().auth.user)).toContain('http://dl/cv.pdf')
  })
  it('shows backend failure and file size', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, statusText: 'Bad' }))
    const { container } = renderWithProviders(<UploadResume setIsUploadResume={vi.fn()} />)
    fireEvent.change(input(container), { target: { files: [pdf(2048)] } })
    expect(await screen.findByText('Upload failed: Bad')).toBeInTheDocument()
    expect(screen.getByText('2 KB')).toBeInTheDocument()
    expect(screen.getByText('cv.pdf')).toBeInTheDocument()
  })
  it('handles drag over/leave and drop, and Choose File button', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: { downloadUrl: 'u' } }) }))
    const close = vi.fn()
    const { container } = renderWithProviders(<UploadResume setIsUploadResume={close} />, { preloadedState: { auth: { user: { user: {} } } } })
    const zone = screen.getByText('Drag and drop your PDF file here').parentElement!
    fireEvent.dragOver(zone)
    expect(zone.className).toContain('border-blue-400')
    fireEvent.dragLeave(zone)
    expect(zone.className).not.toContain('border-blue-400')
    const click = vi.spyOn(input(container), 'click')
    await userEvent.click(screen.getByRole('button', { name: /Choose File/ }))
    expect(click).toHaveBeenCalled()
    fireEvent.drop(zone, { dataTransfer: { files: [pdf()] } })
    await waitFor(() => expect(close).toHaveBeenCalledWith(false))
  })
})
