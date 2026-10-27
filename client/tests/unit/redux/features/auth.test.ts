import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import reducer, * as s from '@/redux/features/auth'
import { createMockStore } from '../../../helpers/mockStore'
import { runThunkCase, silenceConsole } from '../../../helpers/thunkHarness'

vi.mock('axios', () => ({ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

beforeEach(silenceConsole)
afterEach(() => vi.restoreAllMocks())

const H = 'http://localhost:8080/api'
const fd = { file: 'x' }

const cases = [
  { name: 'createOrganization', thunk: s.createOrganization, arg: { n: 1 }, method: 'post', url: `${H}/organization/new`, body: { n: 1 }, data: { id: 'o1' }, fallback: 'Failed creating organization' },
  { name: 'getAllOrganizations', thunk: s.getAllOrganizations, method: 'get', url: `${H}/organization/all`, data: { data: [] }, fallback: 'Failed fetching organizations' },
  { name: 'deleteOrganization', thunk: s.deleteOrganization, arg: 'o1', method: 'delete', url: `${H}/organization/o1`, data: {}, payload: 'o1', fallback: 'Failed deleting organizations' },
  { name: 'updateOrganization', thunk: s.updateOrganization, arg: { organizationId: 'o1', data: { a: 1 } }, method: 'patch', url: `${H}/organization/o1`, body: { a: 1 }, data: { data: { id: 'o1' } }, fallback: 'Failed Editing organizations' },
  { name: 'fetchUserData', thunk: s.fetchUserData, method: 'get', url: `${H}/user/profile`, data: { data: {} }, fallback: 'Failed fetching user data' },
  { name: 'updateUserData', thunk: s.updateUserData, arg: { b: 1 }, method: 'patch', url: `${H}/user/update/details`, body: { b: 1 }, data: { data: {} }, fallback: 'Failed updating user data' },
  { name: 'updateUserCoverPhoto', thunk: s.updateUserCoverPhoto, arg: fd, method: 'post', url: `${H}/user/update/cover-photo`, body: fd, data: { url: 'u' }, fallback: 'Failed updating user cover photo' },
  { name: 'updateUserProfilePhoto', thunk: s.updateUserProfilePhoto, arg: fd, method: 'post', url: `${H}/user/update/profile-photo`, body: fd, data: { url: 'u' }, fallback: 'Failed updating user cover photo' },
  { name: 'analyzeResume', thunk: s.analyzeResume, method: 'get', url: `${H}/resume/extract`, data: { data: {} }, fallback: 'Failed analyzing user resume' },
  { name: 'saveAnalyzedResume', thunk: s.saveAnalyzedResume, arg: { r: 1 }, method: 'post', url: `${H}/resume/save`, body: { r: 1 }, data: {}, payload: { r: 1 }, fallback: 'Failed analyzing user resume' },
] as const

describe('auth thunks (request + error handling)', () => {
  for (const c of cases) {
    const h = runThunkCase(axios, c as any)
    it(`${c.name} success`, h.success)
    it(`${c.name} server error`, h.serverError)
    it(`${c.name} network error`, h.networkError)
  }
})

const base = () => reducer(undefined, { type: 'x' })
const withUser = () => ({ ...base(), user: { user: { email: 'e' } } })

describe('auth reducers', () => {
  it('initial state', () => {
    const st = base()
    expect(st.user).toBeNull()
    expect(st.isSignedIn).toBe(false)
    expect(st.registerFormData).toEqual({ name: '', email: '', password: '', role: null })
    expect(st.organizations).toEqual([])
  })

  it('plain reducers', () => {
    let st = reducer(base(), s.setFormData({ name: 'email', value: 'a@b.c' }))
    expect(st.registerFormData.email).toBe('a@b.c')
    st = reducer(st, s.setFormData({ name: 'role', value: null }))
    expect(st.registerFormData.role).toBeNull()
    expect(reducer(withUser(), s.resetUser()).user).toBeNull()
    expect(reducer(base(), s.setOrgCreationStatus('error')).orgCreationStatus).toBe('error')
    expect(reducer(base(), s.setOrgFetchStatus('error')).orgFetchStatus).toBe('error')
    expect(reducer(base(), s.setOrgUpdateStatus('error')).orgUpdateStatus).toBe('error')
    expect(reducer(base(), s.setUserBasicInfoUpdateStatus('error')).userBasicInfoUpdateStatus).toBe('error')
    expect(reducer(base(), s.setAnalyzeUserResumeStatus('error')).analyzeUserResumeStatus).toBe('error')
    expect(reducer(withUser(), s.setResume('http://r')).user.user.resumeUrl).toBe('http://r')
    expect(reducer(base(), s.setIsSingedIn(true)).isSignedIn).toBe(true)
  })

  it('reducers not re-exported as action creators still work via action type', () => {
    expect(reducer(base(), { type: 'auth/setOrgDeleteStatus', payload: 'error' }).orgDeleteStatus).toBe('error')
    expect(reducer(base(), { type: 'auth/setUserCoverPhotoStatus', payload: 'error' }).userCoverPhotoUpdateStatus).toBe('error')
    expect(reducer(base(), { type: 'auth/setUserProfilePhotoStatus', payload: 'error' }).userProfilePhotoUpdateStatus).toBe('error')
  })

  // [thunk, statusKey, fulfilled-payload, extra assertion on resulting state]
  const lifecycles: [string, any, string, any, (st: any) => void, any?][] = [
    ['fetchUserData', s.fetchUserData, 'userStatus', { data: { user: { id: 1 } } }, (st) => expect(st.user).toEqual({ user: { id: 1 } })],
    ['updateUserData', s.updateUserData, 'userBasicInfoUpdateStatus', { data: { name: 'N' } }, (st) => expect(st.user.user).toEqual({ name: 'N' }), withUser()],
    ['createOrganization', s.createOrganization, 'orgCreationStatus', { id: 'o' }, (st) => expect(st.organizations).toEqual([{ id: 'o' }])],
    ['getAllOrganizations', s.getAllOrganizations, 'orgFetchStatus', { data: [{ id: 'a' }] }, (st) => expect(st.organizations).toEqual([{ id: 'a' }])],
    ['deleteOrganization', s.deleteOrganization, 'orgDeleteStatus', 'a', (st) => expect(st.organizations).toEqual([{ id: 'b' }]), { ...base(), organizations: [{ id: 'a' }, { id: 'b' }] }],
    ['updateOrganization', s.updateOrganization, 'orgUpdateStatus', { data: { id: 'a', n: 2 } }, (st) => expect(st.organizations).toEqual([{ id: 'b' }, { id: 'a', n: 2 }]), { ...base(), organizations: [{ id: 'a' }, { id: 'b' }] }],
    ['updateUserCoverPhoto', s.updateUserCoverPhoto, 'userCoverPhotoUpdateStatus', { url: 'cover' }, (st) => expect(st.user.user.coverPictureUrl).toBe('cover'), withUser()],
    ['updateUserProfilePhoto', s.updateUserProfilePhoto, 'userProfilePhotoUpdateStatus', { url: 'pp' }, (st) => expect(st.user.user.profilePictureUrl).toBe('pp'), withUser()],
    ['analyzeResume', s.analyzeResume, 'analyzeUserResumeStatus', { data: { skills: [] } }, (st) => expect(st.analyzedUserResume).toEqual({ skills: [] })],
    ['saveAnalyzedResume', s.saveAnalyzedResume, 'saveUserResumeStatus', { r: 1 }, (st) => expect(st.user.resumeData).toEqual({ r: 1 }), withUser()],
  ]

  for (const [name, thunk, key, payload, check, start] of lifecycles) {
    it(`${name}: pending/rejected/fulfilled`, () => {
      const init = start ?? base()
      expect(reducer(init, thunk.pending('rid', undefined as any))[key as keyof ReturnType<typeof base>]).toBe('pending')
      expect(reducer(init, thunk.rejected(null, 'rid', undefined as any))[key as keyof ReturnType<typeof base>]).toBe('error')
      const st: any = reducer(init, thunk.fulfilled(payload, 'rid', undefined as any))
      expect(st[key]).toBe('success')
      check(st)
    })
  }

  it('end-to-end through a store with selectors', async () => {
    const store = createMockStore()
    ;(axios.get as any).mockResolvedValueOnce({ data: { data: { user: { name: 'Z' } } } })
    await store.dispatch(s.fetchUserData() as any)
    const st = store.getState()
    expect(s.user(st)).toEqual({ user: { name: 'Z' } })
    expect(s.userStatus(st)).toBe('success')
    expect(s.organizations(st)).toEqual([])
    expect(s.orgCreationStatus(st)).toBe('idle')
    expect(s.orgFetchStatus(st)).toBe('idle')
    expect(s.orgUpdateStatus(st)).toBe('idle')
    expect(s.orgDeleteStatus(st)).toBe('idle')
    expect(s.userCoverPhotoUpdateStatus(st)).toBe('idle')
    expect(s.userProfilePhotoUpdateStatus(st)).toBe('idle')
    expect(s.userBasicInfoUpdateStatus(st)).toBe('idle')
    expect(s.analyzeUserResumeStatus(st)).toBe('idle')
    expect(s.saveUserResumeStatus(st)).toBe('idle')
    expect(s.analyzedUserResume(st)).toBeNull()
    expect(s.isSignedIn(st)).toBe(false)
    expect(s.currentFormData(st)).toEqual({ name: '', email: '', password: '', role: null })
  })
})
