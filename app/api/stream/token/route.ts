import { NextResponse } from "next/server";
import { StreamClient } from "@stream-io/node-sdk";

export async function POST(req: Request) {
  try {
    const { userId, name, image } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const client = new StreamClient(
      process.env.NEXT_PUBLIC_STREAM_API_KEY!,
      process.env.STREAM_API_SECRET!
    );

    const token = client.createToken(userId);

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Stream token error:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
