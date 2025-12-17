import { NextResponse } from "next/server"
import { StreamClient } from "@stream-io/node-sdk"

export async function POST(req: Request) {
  try {
    const { meetingId, userId, name, image } = await req.json()

    if (!meetingId || !userId) {
      return NextResponse.json({ error: "Missing meetingId or userId" }, { status: 400 })
    }

    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!
    const apiSecret = process.env.STREAM_API_SECRET!

    // Initialize the Stream client
    const client = new StreamClient(apiKey, apiSecret)

    // Create or get the call
    const call = client.video.call("default", meetingId)
    await call.getOrCreate({
      data: {
        created_by_id: userId,
        members: [{ user_id: userId }]
      }
    })

    // Generate a token for the user
    const token = client.generateUserToken({ 
      user_id: userId,
      validity_in_seconds: 3600 // Token valid for 1 hour
    })

    return NextResponse.json({ token })
  } catch (error) {
    console.error("Error creating Stream video room:", error)
    return NextResponse.json({ error: "Failed to create room or generate token" }, { status: 500 })
  }
}