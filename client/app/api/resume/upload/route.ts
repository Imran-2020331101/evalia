import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Forward the request to the AI server
    const aiServerResponse = await fetch('http://localhost:5000/api/resume/upload', {
      method: 'POST',
      body: formData,
    })

    if (!aiServerResponse.ok) {
      throw new Error(`AI Server responded with status: ${aiServerResponse.status}`)
    }

    const result = await aiServerResponse.json()
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Resume upload failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process resume upload',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
