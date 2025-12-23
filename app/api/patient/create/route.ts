import { NextRequest, NextResponse } from "next/server";
import { createPatient } from "@/utils/services/patient";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const result = await createPatient({ id: userId, ...body });

    if (!result.success) return NextResponse.json({ success: false, message: result.message }, { status: 400 });

    return NextResponse.json({ success: true, data: result.data });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
