// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

describe('breadcrumb primitives', () => {
  it('renders a full breadcrumb trail', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList className="x">
          <BreadcrumbItem><BreadcrumbLink href="/a">A</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Current</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'A' })).toHaveAttribute('href', '/a')
    expect(screen.getByText('Current')).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('list')).toHaveClass('x')
  })

  it('BreadcrumbLink asChild renders the child element', () => {
    render(<BreadcrumbLink asChild><button>btn</button></BreadcrumbLink>)
    expect(screen.getByRole('button', { name: 'btn' })).toHaveAttribute('data-slot', 'breadcrumb-link')
  })

  it('separator supports custom children and ellipsis has sr text', () => {
    const { container } = render(<><BreadcrumbSeparator>/</BreadcrumbSeparator><BreadcrumbEllipsis /></>)
    expect(container.querySelector('[data-slot="breadcrumb-separator"]')).toHaveTextContent('/')
    expect(screen.getByText('More')).toBeInTheDocument()
  })
})
