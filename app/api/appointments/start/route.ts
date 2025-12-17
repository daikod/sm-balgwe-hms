import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/lib/db";
import { AppointmentStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { appointmentId } = await req.json();

    const appointment = await db.appointment.update({
      where: { id: appointmentId },
      data: {
        status: AppointmentStatus.IN_PROGRESS, // use enum
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error("Error starting consultation:", error);
    return NextResponse.json(
      { error: "Failed to start consultation" },
      { status: 500 }
    );
  }
}
