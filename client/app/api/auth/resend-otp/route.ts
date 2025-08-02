import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Basic validation
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
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

    // Call your backend resend OTP service
    const backendResponse = await fetch('http://localhost:8080/api/auth/resend-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    if (!backendResponse.ok) {
      let errorMessage = 'Failed to resend OTP'
      try {
        const errorData = await backendResponse.json()
        errorMessage = errorData.message || errorMessage
      } catch {
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

    let result
    const contentType = backendResponse.headers.get('content-type')
    
    if (contentType && contentType.includes('application/json')) {
      result = await backendResponse.json()
    } else {
      const textResponse = await backendResponse.text()
      result = { message: textResponse }
    }

    return NextResponse.json({
      success: true,
      message: result.message || 'OTP has been resent to your email',
      data: result.data || null
    })

  } catch (error) {
    console.error('Resend OTP error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
