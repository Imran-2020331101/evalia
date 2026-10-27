// @vitest-environment jsdom
import { expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NProgress from 'nprogress'
import ProgressLink from '@/components/utils/ProgressLink'

it('starts NProgress and forwards onClick', async () => {
  const start = vi.spyOn(NProgress, 'start')
  const onClick = vi.fn()
  render(<ProgressLink href="/x" onClick={onClick}>Go</ProgressLink>)
  const a = screen.getByRole('link', { name: 'Go' })
  expect(a).toHaveAttribute('href', '/x')
  await userEvent.click(a)
  expect(start).toHaveBeenCalled()
  expect(onClick).toHaveBeenCalledTimes(1)
})

it('works without onClick', async () => {
  render(<ProgressLink href="/y">Y</ProgressLink>)
  await userEvent.click(screen.getByRole('link'))
})
