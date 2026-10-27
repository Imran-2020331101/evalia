// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useAppSelector } from '@/redux/lib/hooks'
import { store } from '@/redux/lib/store'
import { ReduxProvider } from '@/app/providers'

const Probe = () => {
  const s = useAppSelector((st) => st.auth)
  return <p>{s ? 'has-auth-slice' : 'none'}</p>
}

it('provides the real redux store to children', () => {
  render(<ReduxProvider><Probe /></ReduxProvider>)
  expect(screen.getByText('has-auth-slice')).toBeInTheDocument()
  expect(Object.keys(store.getState())).toEqual(expect.arrayContaining(['auth', 'job', 'utils', 'course']))
})
