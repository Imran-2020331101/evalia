import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const res = NextResponse.json({ success: true, message: 'Logged out' })

    // 1) Explicitly expire known cookies (match names you set on login)
    const knownCookies = ['token', 'tokenType', 'userEmail', 'userName']
    for (const name of knownCookies) {
      res.cookies.set(name, '', {
        path: '/',
        maxAge: 0, // expire immediately
      })
    }

    // 2) Also try to clear any cookie present on the incoming request
    const cookieHeader = request.headers.get('cookie')
    if (cookieHeader) {
      // cookieHeader looks like: "a=1; b=2; c=3"
      const pairs = cookieHeader.split(';')
      for (const pair of pairs) {
        const name = pair.split('=')[0].trim()
        if (!name) continue
        // Avoid re-setting known ones twice is harmless, but we still set for completeness
        res.cookies.set(name, '', {
          path: '/',
          maxAge: 0,
        })
      }
    }

    return res
  } catch (error) {
    console.error('Logout route error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
