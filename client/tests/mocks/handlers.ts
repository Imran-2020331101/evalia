// Plain fetch mocks (msw not used). Each helper returns a Response-like object.
export type FetchStub = (url: string, init?: RequestInit) => Promise<Response>

export const jsonResponse = (body: any, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } })

export const textResponse = (text: string, status = 200) =>
  new Response(text, { status, headers: { 'content-type': 'text/plain' } })

export const handlers = {
  loginOk: () => jsonResponse({ name: 'A', email: 'a@b.co', roles: ['USER'], accessToken: 'tok', tokenType: 'Bearer' }),
  backendDown: () => Promise.reject(new Error('ECONNREFUSED')),
}
