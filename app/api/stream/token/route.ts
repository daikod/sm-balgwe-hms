import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const { userId, name, image } = await req.json()

    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!
    const apiSecret = process.env.STREAM_API_SECRET!

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Generate JWT manually
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64')
    const payload = Buffer.from(
      JSON.stringify({
        sub: userId,
        name: name || 'User',
        image: image || '',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
      })
    ).toString('base64')

    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(`${header}.${payload}`)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    const token = `${header}.${payload}.${signature}`

    return NextResponse.json({ token })
  } catch (err) {
    console.error('Error generating Stream token:', err)
    return NextResponse.json({ error: 'Failed to generate video token' }, { status: 500 })
  }
}
