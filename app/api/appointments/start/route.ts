import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/lib/db";
import { AppointmentStatus } from "@prisma/client";
import { sendVideoCallStartedEmail } from "@/utils/email";
import prisma from "@/lib/db"


export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { appointmentId } = await req.json();

    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        doctor: true,
      },
    });

    if (!appointment || appointment.doctor_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const roomID = appointment.roomID ?? `appointment-${appointment.id}`;

    await db.appointment.update({
      where: { id: appointmentId },
      data: {
        status: AppointmentStatus.IN_PROGRESS,
        roomID,
        updated_at: new Date(),
      },
    });

    // 🔔 Send email to patient
    if (appointment.patient?.email) {
      await sendVideoCallStartedEmail({
        to: appointment.patient.email,
        patientName: appointment.patient.first_name,
        doctorName: appointment.doctor?.name || "Doctor",
        roomID,
      });
    }

    if (appointment.doctor?.email) {
      await sendVideoCallStartedEmail({
        to: appointment.doctor.email,
        patientName: appointment.patient.first_name,
        doctorName: appointment.doctor.name,
        roomID,
      });
    }

    await prisma.notification.create({
      data: {
        userId: appointment.patient_id,
        userRole: "PATIENT",
        title: "Incoming Video Consultation",
        message: `Dr. ${appointment.doctor?.name} has started a video call`,
        type: "appointment",
        priority: "urgent",
        actionUrl: `/video/${roomID}`,
      },
    });

    await prisma.notification.create({
      data: {
        userId: appointment.doctor_id,
        userRole: "DOCTOR",
        title: "Video Consultation Started",
        message: `Your video consultation with ${appointment.patient.first_name} has started.`,
        type: "appointment",
        priority: "normal",
        actionUrl: `/video/${roomID}`,
      },
    });

    return NextResponse.json({ roomID });
  } catch (error) {
    console.error("Error starting consultation:", error);
    return NextResponse.json(
      { error: "Failed to start consultation" },
      { status: 500 }
    );
  }
}
