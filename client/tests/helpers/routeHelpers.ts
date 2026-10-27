import { NextRequest } from 'next/server'
import { vi } from 'vitest'

type NextRequestInit = NonNullable<ConstructorParameters<typeof NextRequest>[1]>

export const req = (url: string, body?: any, init: NextRequestInit = {}) =>
  new NextRequest(`http://localhost:3000${url}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(init.headers as any) },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
    ...init,
    ...(init.headers ? { headers: { 'content-type': 'application/json', ...(init.headers as any) } } : {}),
  })

/** Fresh import of a route module, optionally with demo mode on. */
export async function loadRoute(path: string, demo = false) {
  vi.resetModules()
  vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', demo ? 'true' : 'false')
  return import(/* @vite-ignore */ path)
}

export const jsonRes = (body: any, status = 200, ct = 'application/json') =>
  new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers: { 'content-type': ct } })
