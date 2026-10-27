// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import DynamicBreadcrumbs from '@/components/ui/dynamicBreadCrumb'
import { setNav } from '../../helpers/navMock'

describe('DynamicBreadcrumbs', () => {
  it('renders only Home at root', () => {
    render(<DynamicBreadcrumbs />)
    expect(screen.getAllByRole('link')).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
  })

  it('builds capitalised cumulative links from the path', () => {
    setNav({ pathname: '/workspace/my-jobs/some%20thing' })
    render(<DynamicBreadcrumbs />)
    expect(screen.getByRole('link', { name: 'Workspace' })).toHaveAttribute('href', '/workspace')
    expect(screen.getByRole('link', { name: 'My Jobs' })).toHaveAttribute('href', '/workspace/my-jobs')
    expect(screen.getByRole('link', { name: 'Some Thing' })).toHaveAttribute('href', '/workspace/my-jobs/some%20thing')
  })
})
