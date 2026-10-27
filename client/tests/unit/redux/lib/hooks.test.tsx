// @vitest-environment jsdom
import React from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { useAppDispatch, useAppSelector } from '@/redux/lib/hooks'
import { createMockStore } from '../../../helpers/mockStore'

describe('typed redux hooks', () => {
  it('useAppSelector reads state and useAppDispatch dispatches', () => {
    const store = createMockStore()
    const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>
    const { result } = renderHook(() => ({ dispatch: useAppDispatch(), open: useAppSelector((s) => s.utils.isShowHamburgerMenu) }), { wrapper })
    expect(result.current.open).toBe(false)
    act(() => {
      result.current.dispatch({ type: 'utils/toggleIsShowHamburgerMenu' })
    })
    expect(result.current.open).toBe(true)
  })
})
