import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { AppointmentStatus } from "@prisma/client";

const ALLOWED_TRANSITIONS: Partial<
  Record<AppointmentStatus, AppointmentStatus[]>
> = {
  PENDING: [AppointmentStatus.SCHEDULED, AppointmentStatus.CANCELLED],
  SCHEDULED: [
    AppointmentStatus.IN_PROGRESS,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.MISSED,
  ],
  IN_PROGRESS: [
    AppointmentStatus.COMPLETED,
    AppointmentStatus.READY_FOR_ADMISSION,
  ],
  READY_FOR_ADMISSION: [AppointmentStatus.COMPLETED],
  COMPLETED: [],
  CANCELLED: [],
  MISSED: [AppointmentStatus.READY_FOR_ADMISSION],
};

export async function POST(req: Request) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (sessionClaims?.publicMetadata as any)?.role;
    if (!role || !["doctor", "admin"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { appointmentId, status } = await req.json();

    if (!Object.values(AppointmentStatus).includes(status)) {
      return NextResponse.json(
        { error: "Invalid appointment status" },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        doctor: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Ownership enforcement
    if (role === "doctor" && appointment.doctorId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // State transition guard
    const allowedNextStates =
      ALLOWED_TRANSITIONS[appointment.status] ?? [];

    if (!allowedNextStates.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid transition from ${appointment.status} to ${status}`,
        },
        { status: 400 }
      );
    }

    const updatedAppointment = await prisma.$transaction(async (tx) => {
      const updated = await tx.appointment.update({
        where: { id: appointmentId },
        data: { status },
      });

      // 🔔 Patient notification
      await tx.notification.create({
        data: {
          userId: appointment.patientId,
          userRole: "PATIENT",
          title: "Appointment Update",
          message: `Your appointment status is now ${status}`,
          type: "appointment",
          relatedId: appointmentId.toString(),
        },
      });

      // 🔔 Doctor notification
      await tx.notification.create({
        data: {
          userId: appointment.doctorId,
          userRole: "DOCTOR",
          title: "Appointment Status Updated",
          message: `Appointment with ${appointment.patient.first_name} is now ${status}`,
          type: "appointment",
          relatedId: appointmentId.toString(),
        },
      });

      return updated;
    });

    return NextResponse.json({ appointment: updatedAppointment });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}
