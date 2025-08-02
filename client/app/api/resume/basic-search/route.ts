import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json()
    console.log('Received request body:', requestBody)
    
    const { job_description } = requestBody
    console.log('Extracted job_description:', job_description)

    const aiServerResponse = await fetch('http://localhost:8080/api/resume/basic-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ job_description }),
    })

    if (!aiServerResponse.ok) {
      throw new Error(`AI Server responded with status: ${aiServerResponse.status}`)
    }

    const result = await aiServerResponse.json()

    return NextResponse.json(result);

  } catch (error) {
    console.error('Basic search error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
