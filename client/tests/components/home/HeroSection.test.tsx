// @vitest-environment jsdom
import { expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import HeroSection from '@/components/home/HeroSection'
import gsap from '../../helpers/gsapMock'

it('renders hero text and starts animations once fonts are ready', async () => {
  Object.defineProperty(document, 'fonts', { configurable: true, value: { status: 'loaded', ready: Promise.resolve() } })
  const { container } = render(<HeroSection />)
  expect(screen.getByText('WHERE,')).toBeInTheDocument()
  expect(screen.getByText(/talent Meets Opportunity/)).toBeInTheDocument()
  expect(screen.getByText(/-Intelligently/)).toBeInTheDocument()
  expect(gsap.set).toHaveBeenCalled()
  expect(gsap.from).toHaveBeenCalled()
  expect(container.querySelectorAll('.rotate-\\[35deg\\]')).toHaveLength(5)
})

it('waits for document.fonts.ready when not loaded, and tracks mouse movement', async () => {
  Object.defineProperty(document, 'fonts', { configurable: true, value: { status: 'loading', ready: Promise.resolve() } })
  vi.mocked(gsap.set).mockClear()
  vi.mocked(gsap.to).mockClear()
  const { container } = render(<HeroSection />)
  await waitFor(() => expect(gsap.set).toHaveBeenCalled())
  fireEvent.mouseMove(container.firstChild as Element, { clientY: 100 })
  expect(gsap.to).toHaveBeenCalledTimes(5)
})
