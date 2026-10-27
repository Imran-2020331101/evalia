import { describe, expect, it, vi } from 'vitest'
import reducer, * as u from '@/redux/features/utils'
import { createMockStore } from '../../../helpers/mockStore'

describe('utils slice', () => {
  const init = reducer(undefined, { type: '@@init' })

  it('has the expected initial state', () => {
    expect(init).toEqual({
      isShowAuthRole: false,
      isShowHamburgerMenu: false,
      compatibilityReviewId: null,
      previewedJob: null,
      previewOrganization: null,
      previewedCandidate: null,
    })
  })
  it('toggles hamburger menu and auth role', () => {
    let s = reducer(init, u.toggleIsShowHamburgerMenu())
    expect(s.isShowHamburgerMenu).toBe(true)
    s = reducer(s, u.toggleIsShowHamburgerMenu())
    expect(s.isShowHamburgerMenu).toBe(false)
    s = reducer(init, u.toggleIsShowAuthRole())
    expect(s.isShowAuthRole).toBe(true)
  })
  it('sets previewed entities', () => {
    expect(reducer(init, u.setPreviewedJob({ id: 1 })).previewedJob).toEqual({ id: 1 })
    expect(reducer(init, u.setPreviewOrganization('o')).previewOrganization).toBe('o')
    expect(reducer(init, u.setPreviewedCandidate('c')).previewedCandidate).toBe('c')
  })
  it('sets compatibility review id', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    expect(reducer(init, u.setCompatibilityReviewId('r1')).compatibilityReviewId).toBe('r1')
    spy.mockRestore()
  })
  it('selectors read from the store', () => {
    const store = createMockStore({ utils: { isShowHamburgerMenu: true, previewedJob: 'j', previewOrganization: 'o', previewedCandidate: 'c', isShowAuthRole: true, compatibilityReviewId: 'r' } })
    const st = store.getState()
    expect(u.isShowHamburgerMenu(st)).toBe(true)
    expect(u.previewedJob(st)).toBe('j')
    expect(u.previewOrganization(st)).toBe('o')
    expect(u.previewedCandidate(st)).toBe('c')
    expect(u.isShowAuthRole(st)).toBe(true)
    expect(u.compatibilityReviewId(st)).toBe('r')
  })
})
