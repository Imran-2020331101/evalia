import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })

    const responseText = await response.text()

    if (response.ok) {
      const data = JSON.parse(responseText)
      
      // Create response with cookies
      const nextResponse = NextResponse.json({
        success: true,
        user: {
          name: data.name,
          email: data.email,
          roles: data.roles,
        },
      })
      
      if (data.accessToken) {
        nextResponse.cookies.set('token', data.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60, // 24 hours
          path: '/',
        })
        
        nextResponse.cookies.set('tokenType', data.tokenType || 'Bearer', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60,
          path: '/',
        })
        
        // Store user info (not sensitive, can be accessible)
        nextResponse.cookies.set('userEmail', data.email, {
          httpOnly: false, // Client can access this
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60,
          path: '/',
        })
        
        nextResponse.cookies.set('userName', data.name, {
          httpOnly: false, // Client can access this
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60,
          path: '/',
        })
      }
      
      return nextResponse
    } else {
      // Forward error from backend
      try {
        const errorData = JSON.parse(responseText)
        return NextResponse.json(
          { success: false, message: errorData.message || 'Login failed' },
          { status: response.status }
        )
      } catch {
        return NextResponse.json(
          { success: false, message: 'Login failed' },
          { status: response.status }
        )
      }
    }
  } catch (error) {
    console.error('Login route error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
