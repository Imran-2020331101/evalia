// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

afterEach(() => { vi.resetModules(); vi.doUnmock('@/lib/demo/config'); vi.doUnmock('@/lib/demo/mockApi') })

describe('DemoBootstrap', () => {
  it('renders nothing outside demo mode but still installs the api', async () => {
    const install = vi.fn()
    vi.doMock('@/lib/demo/config', () => ({ DEMO: false }))
    vi.doMock('@/lib/demo/mockApi', () => ({ installDemoApi: install }))
    const { default: DemoBootstrap } = await import('@/components/utils/DemoBootstrap')
    const { container } = render(<DemoBootstrap />)
    expect(container).toBeEmptyDOMElement()
    expect(install).toHaveBeenCalledTimes(1)
  })

  it('shows the live demo badge in demo mode', async () => {
    vi.doMock('@/lib/demo/config', () => ({ DEMO: true }))
    vi.doMock('@/lib/demo/mockApi', () => ({ installDemoApi: vi.fn() }))
    const { default: DemoBootstrap } = await import('@/components/utils/DemoBootstrap')
    render(<DemoBootstrap />)
    expect(screen.getByText(/LIVE DEMO/)).toBeInTheDocument()
  })
})
