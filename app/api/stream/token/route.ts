import { NextResponse } from 'next/server'
import { StreamChat } from 'stream-chat'

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()

    const apiKey = process.env.STREAM_API_KEY!
    const apiSecret = process.env.STREAM_API_SECRET!

    const serverClient = StreamChat.getInstance(apiKey, apiSecret)
    const token = serverClient.createToken(userId)

    return NextResponse.json({ token })
  } catch (error) {
    console.error('Error generating Stream token:', error)
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    )
  }
}
