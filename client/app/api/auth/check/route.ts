import { NextResponse } from 'next/server'

// Placeholder: session state is carried by the cookies set on login.
export async function GET() {
  return NextResponse.json({ success: true })
}
