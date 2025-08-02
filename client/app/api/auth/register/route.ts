import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json()

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Call your backend registration service
    const backendResponse = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role
      }),
    })

    if (!backendResponse.ok) {
      // Try to parse as JSON first, fall back to text
      let errorMessage = 'Registration failed'
      try {
        const errorData = await backendResponse.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        // If JSON parsing fails, try to get text response
        const errorText = await backendResponse.text()
        errorMessage = errorText || errorMessage
      }
      
      return NextResponse.json(
        { 
          success: false, 
          message: errorMessage
        },
        { status: backendResponse.status }
      )
    }

    // Handle successful response - could be JSON or plain text
    let result
    const contentType = backendResponse.headers.get('content-type')
    
    if (contentType && contentType.includes('application/json')) {
      result = await backendResponse.json()
    } else {
      // Handle plain text response like "User registered success!"
      const textResponse = await backendResponse.text()
      result = { message: textResponse }
    }

    return NextResponse.json({
      success: true,
      message: result.message || 'Registration successful',
      data: result.data || null
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
