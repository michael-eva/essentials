import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/env'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // Check against server-side environment variable with fallback
    const isValidPassword = password === env.WAITLIST_PASSWORD || password === 'early-access-2024'

    if (isValidPassword) {
      // Create response with success and set a secure cookie for persistent access
      const response = NextResponse.json({ success: true })
      
      // Set a secure, HTTP-only cookie that expires in 30 days
      response.cookies.set('waitlist-access', 'granted', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
        path: '/'
      })

      return response
    } else {
      return NextResponse.json(
        { error: 'Invalid access code' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Waitlist validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if user already has access via cookie
    const waitlistAccess = request.cookies.get('waitlist-access')
    
    if (waitlistAccess?.value === 'granted') {
      return NextResponse.json({ hasAccess: true })
    } else {
      return NextResponse.json({ hasAccess: false })
    }
  } catch (error) {
    console.error('Waitlist access check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}