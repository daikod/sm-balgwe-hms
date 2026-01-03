import { NextResponse } from "next/server";
import { StreamClient } from "@stream-io/node-sdk";
import { adminDoctorNurse } from "@/lib/api-guard";

export async function POST(req: Request) {
  const { userId, role } = await adminDoctorNurse();

  try {
    const { meetingId, userId } = await req.json();

    if (!meetingId || !userId) {
      return NextResponse.json(
        { error: "Missing meetingId or userId" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
    const apiSecret = process.env.STREAM_API_SECRET!;

    const client = new StreamClient(apiKey, apiSecret);

    // ✅ Correct call signature: type + id
    const call = client.video.call("default", meetingId);

    // ✅ members only accept user_id
    await call.getOrCreate({
      data: {
        created_by_id: userId,
        members: [{ user_id: userId }],
      },
    });

    // Generate 1-hour user token
    const token = client.generateUserToken({
      user_id: userId,
      validity_in_seconds: 3600,
    });

    return NextResponse.json({ success: true, createdBy: userId, role, token });
  } catch (error) {
    console.error("Error creating Stream video room:", error);
    return NextResponse.json(
      { error: "Failed to create room or generate token" },
      { status: 500 }
    );
  }
}
