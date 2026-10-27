// @vitest-environment jsdom
import { expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const mods: Record<string, string> = {
  'ui/dynamicBreadCrumb': 'Breadcrumbs',
  'workspace/menu/MenuContainer': 'Menu',
  'workspace/modals/CandidateProfilePreview': 'CandidatePreview',
  'workspace/modals/OrganizationPreview': 'OrgPreview',
  'workspace/modals/PreviewInterviewSummary': 'InterviewSummary',
  'workspace/recruiters/jobs/my-jobs/shortlist/PreviewedShortListModal': 'ShortlistModal',
}
for (const [p, id] of Object.entries(mods)) vi.doMock(`@/components/${p}`, () => ({ default: () => <div data-testid={id} /> }))
const { default: Layout } = await import('@/app/workspace/layout')

it('mounts menu, breadcrumbs, modals and children', () => {
  render(<Layout><p>page body</p></Layout>)
  for (const id of Object.values(mods)) expect(screen.getByTestId(id)).toBeInTheDocument()
  expect(screen.getByText('page body')).toBeInTheDocument()
})
