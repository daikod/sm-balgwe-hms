import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  req: NextRequest,
  context: any // ✅ bypass TypeScript internal type mismatch
) {
  // Cast params to correct type
  const { id } = context.params as { id: string };

  if (!id) {
    return NextResponse.json({ success: false, message: "No ID provided" });
  }

  try {
    const patient = await db.patient.findUnique({ where: { id } });

    return NextResponse.json({
      success: true,
      data: patient ?? null,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
}
