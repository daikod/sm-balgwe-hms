import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { AppointmentStatus, AppointmentType } from "@prisma/client";
import { sendVideoCallStartedEmail } from "@/utils/email";

export async function POST(req: Request) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (sessionClaims?.publicMetadata as any)?.role;
    if (role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { appointmentId } = await req.json();

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        doctor: true,
      },
    });

    if (!appointment || appointment.doctorId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /* --- HARD GUARDS (MANDATORY) --- */

    if (appointment.type !== AppointmentType.VIDEO) {
      return NextResponse.json(
        { error: "Not a video appointment" },
        { status: 400 }
      );
    }

    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      return NextResponse.json(
        { error: `Cannot start appointment in state ${appointment.status}` },
        { status: 400 }
      );
    }

    const roomID =
      appointment.roomID && appointment.roomID.trim() !== ""
        ? appointment.roomID
        : `appointment-${appointment.id}`;

    /* --- TRANSACTION: STATE + NOTIFICATIONS --- */
    await prisma.$transaction(async (tx) => {
      await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          status: AppointmentStatus.IN_PROGRESS,
          roomID,
        },
      });

      const existingPatientNotification = await tx.notification.findFirst({
        where: {
          userId: appointment.patientId,
          type: "appointment",
          relatedId: appointmentId.toString(),
        },
      });

      if (!existingPatientNotification) {
        await tx.notification.create({
          data: {
            userId: appointment.patientId,
            userRole: "PATIENT",
            title: "Incoming Video Consultation",
            message: `Dr. ${appointment.doctor?.name} has started a video call`,
            type: "appointment",
            priority: "urgent",
            relatedId: appointmentId.toString(),
            actionUrl: `/video/${roomID}`,
          },
        });
      }

      await tx.notification.create({
        data: {
          userId: appointment.doctorId,
          userRole: "DOCTOR",
          title: "Video Consultation Started",
          message: `Your video consultation with ${appointment.patient.first_name} has started.`,
          type: "appointment",
          priority: "normal",
          relatedId: appointmentId.toString(),
          actionUrl: `/video/${roomID}`,
        },
      });
    });

    /* --- EMAILS (SIDE EFFECTS, SAFE AFTER COMMIT) --- */
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

    return NextResponse.json({ roomID });
  } catch (error) {
    console.error("Error starting consultation:", error);
    return NextResponse.json(
      { error: "Failed to start consultation" },
      { status: 500 }
    );
  }
}
