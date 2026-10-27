// @vitest-environment jsdom
import { expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

const mocks: Record<string, string> = {
  'nav/NavBar': 'NavBar',
  'utils/ProgressBar': 'ProgressBar',
  'modal/HamburgerMenu': 'Hamburger',
  'workspace/modals/JobPreview': 'JobPreview',
  'notification/NotificationListener': 'Notif',
  'utils/DemoBootstrap': 'Demo',
}
for (const [p, id] of Object.entries(mocks)) vi.doMock(`@/components/${p}`, () => ({ default: () => <div data-testid={id} /> }))
vi.doMock('sonner', () => ({ Toaster: (p: any) => <div data-testid="Toaster" data-pos={p.position} /> }))
vi.doMock('@/app/providers', () => ({ ReduxProvider: ({ children }: any) => <div data-testid="Provider">{children}</div> }))
vi.doMock('@/app/globals.css', () => ({}))

const { default: RootLayout, metadata } = await import('@/app/layout')

it('exports metadata', () => {
  expect(metadata.title).toBe('EVALIA')
  expect(metadata.description).toMatch(/hiring platform/)
})

it('builds html/body with provider, global widgets and children', () => {
  const el = RootLayout({ children: <p>page</p> }) as React.ReactElement<any>
  expect(el.type).toBe('html')
  expect(el.props.lang).toBe('en')
  // <html> cannot be mounted in a div; render the body subtree.
  const body = (el.props.children as React.ReactElement<any>)
  expect(body.type).toBe('body')
  render(<>{body.props.children}</>)
  for (const id of [...Object.values(mocks), 'Provider', 'Toaster']) expect(screen.getByTestId(id)).toBeInTheDocument()
  expect(screen.getByTestId('Toaster')).toHaveAttribute('data-pos', 'bottom-center')
  expect(screen.getByText('page')).toBeInTheDocument()
  expect(screen.getByRole('main')).toContainElement(screen.getByText('page'))
})
