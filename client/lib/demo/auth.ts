import { NextResponse } from 'next/server'
import { DEMO_CANDIDATE_EMAIL, DEMO_RECRUITER_EMAIL } from './config'

// Any credentials work in demo mode. An email containing "recruiter" gets the recruiter workspace.
export function demoLogin(email?: string) {
  const isRecruiter = /recruiter/i.test(email ?? '')
  const profile = isRecruiter
    ? { name: 'Jordan Hayes', email: DEMO_RECRUITER_EMAIL, roles: ['RECRUITER'] }
    : { name: 'Alex Rahman', email: DEMO_CANDIDATE_EMAIL, roles: ['USER'] }

  const res = NextResponse.json({ success: true, user: profile })
  const opts = { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, maxAge: 24 * 60 * 60, path: '/' }
  res.cookies.set('token', 'demo-token', { ...opts, httpOnly: true })
  res.cookies.set('tokenType', 'Bearer', { ...opts, httpOnly: true })
  res.cookies.set('userEmail', profile.email, opts)
  res.cookies.set('userName', profile.name, opts)
  return res
}

export const demoOk = (message = 'ok') => NextResponse.json({ success: true, message })
