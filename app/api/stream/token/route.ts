import { NextResponse } from "next/server";
import { StreamClient } from "@stream-io/node-sdk";
import { adminDoctorNurse } from "@/lib/api-guard";

export async function GET(req: Request) {
  const { userId, role } = await adminDoctorNurse();

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

    // ✅ Generate token for given user
    const token = client.generateUserToken({
      user_id: userId,
      validity_in_seconds: 3600, // 1 hour
    });

    return NextResponse.json({ success: true, userId, role, token });
  } catch (error) {
    console.error("Stream token error:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
