// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import UploadResume from '@/components/auth/requirements/candidate/UploadResume'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'
import { router } from '../../../../helpers/navMock'

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

const pdf = (size = 2048) => {
  const f = new File(['x'], 'cv.pdf', { type: 'application/pdf' })
  Object.defineProperty(f, 'size', { value: size })
  return f
}
const fileInput = (c: HTMLElement) => c.querySelector('input[type="file"]') as HTMLInputElement

beforeEach(() => { vi.clearAllMocks(); vi.unstubAllGlobals() })

describe('auth UploadResume', () => {
  it('renders instructions and tips', () => {
    renderWithProviders(<UploadResume onSignUp />)
    expect(screen.getByText('Upload Your CV/Resume')).toBeInTheDocument()
    expect(screen.getByText('Drag and drop your PDF file here')).toBeInTheDocument()
    expect(screen.getByText('Tips for Best Results')).toBeInTheDocument()
  })

  it('rejects non-PDF files', async () => {
    const { container } = renderWithProviders(<UploadResume />)
    fireEvent.change(fileInput(container), { target: { files: [new File(['x'], 'a.png', { type: 'image/png' })] } })
    expect(await screen.findByText('Please upload a PDF file only')).toBeInTheDocument()
  })

  it('rejects files over 10MB', async () => {
    const { container } = renderWithProviders(<UploadResume />)
    fireEvent.change(fileInput(container), { target: { files: [pdf(11 * 1024 * 1024)] } })
    expect(await screen.findByText('File size must be less than 10MB')).toBeInTheDocument()
  })

  it('uploads a valid PDF then redirects to login', async () => {
    const f = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })
    vi.stubGlobal('fetch', f)
    const { container } = renderWithProviders(<UploadResume />)
    fireEvent.change(fileInput(container), { target: { files: [pdf()] } })
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/auth/login'))
    expect(f).toHaveBeenCalledWith(expect.stringContaining('/resume/upload'), expect.objectContaining({ method: 'POST', credentials: 'include' }))
    expect(toast.success).toHaveBeenCalled()
  })

  it('shows an error when the upload fails and allows retry', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, statusText: 'Server Error' }))
    const { container } = renderWithProviders(<UploadResume />)
    fireEvent.change(fileInput(container), { target: { files: [pdf(1536)] } })
    expect(await screen.findByText('Upload failed: Server Error')).toBeInTheDocument()
    expect(screen.getByText('1.5 KB')).toBeInTheDocument()
    expect(screen.getByText('cv.pdf')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(screen.queryByText('Upload Status')).not.toBeInTheDocument()
  })

  it('shows a generic message on non-Error rejections', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue('boom'))
    const { container } = renderWithProviders(<UploadResume />)
    fireEvent.change(fileInput(container), { target: { files: [pdf()] } })
    expect(await screen.findByText('Upload failed. Please try again.')).toBeInTheDocument()
  })

  it('accepts drag and drop', async () => {
    const f = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })
    vi.stubGlobal('fetch', f)
    renderWithProviders(<UploadResume />)
    const zone = screen.getByText('Drag and drop your PDF file here').parentElement!
    fireEvent.dragOver(zone)
    expect(zone.className).toContain('border-blue-400')
    fireEvent.dragLeave(zone)
    expect(zone.className).not.toContain('border-blue-400')
    fireEvent.drop(zone, { dataTransfer: { files: [pdf()] } })
    await waitFor(() => expect(f).toHaveBeenCalled())
  })

  it('choose file button opens the picker', async () => {
    const { container } = renderWithProviders(<UploadResume />)
    const click = vi.spyOn(fileInput(container), 'click')
    await userEvent.click(screen.getByRole('button', { name: /Choose File/ }))
    expect(click).toHaveBeenCalled()
  })
})
