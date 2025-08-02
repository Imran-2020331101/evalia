import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    // Basic validation
    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    if (otp.length !== 4 || !/^\d{4}$/.test(otp)) {
      return NextResponse.json(
        { success: false, message: 'OTP must be 4 digits' },
        { status: 400 }
      )
    }

    // Call your backend OTP verification service
    const backendResponse = await fetch('http://localhost:8080/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        otp
      }),
    })

    // Handle successful response - could be JSON or plain text
    if (!backendResponse.ok) {
      let errorMessage = 'OTP verification failed'
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
      message: result.message || 'Email verified successfully',
      data: result.data || null
    })

  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
