import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { AppointmentStatus, AppointmentType, Role } from "@prisma/client";
import { sendMissedCallEmail } from "@/utils/email";
import { adminOnly } from "@/lib/api-guard";

const PATIENT_MISSED_MINUTES = 5;
const DOCTOR_MISSED_MINUTES = 5;

export async function GET(req: Request) {
  const { userId } = await adminOnly(); 
  try {
    /* =====================
       AUTH — ADMIN ONLY
    ====================== */
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.publicMetadata as any)?.role;

    if (!userId || role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = Date.now();

    /* =========================
       PATIENT MISSED CALLS
    ========================= */
    const patientMissedThreshold = new Date(
      now - PATIENT_MISSED_MINUTES * 60 * 1000
    );

    const patientMissedAppointments = await prisma.appointment.findMany({
      where: {
        type: AppointmentType.VIDEO,
        status: AppointmentStatus.IN_PROGRESS,
        updated_at: { lt: patientMissedThreshold },
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    for (const appointment of patientMissedAppointments) {
      await prisma.$transaction(async (tx) => {
        const alreadyHandled = await tx.notification.findFirst({
          where: {
            relatedId: appointment.id.toString(),
            type: "appointment",
            title: "Missed Video Consultation",
          },
        });
        if (alreadyHandled) return;

        await tx.appointment.update({
          where: { id: appointment.id },
          data: { status: AppointmentStatus.MISSED },
        });

        await tx.notification.create({
          data: {
            userId: appointment.patientId,
            userRole: Role.PATIENT,
            title: "Missed Video Consultation",
            message: `You missed your video consultation with Dr. ${appointment.doctor.name}.`,
            type: "appointment",
            priority: "high",
            relatedId: appointment.id.toString(),
            actionUrl: `/appointments/${appointment.id}`,
          },
        });

        await tx.notification.create({
          data: {
            userId: appointment.doctorId,
            userRole: Role.DOCTOR,
            title: "Patient Missed Consultation",
            message: `${appointment.patient.first_name} did not join the scheduled video consultation.`,
            type: "appointment",
            priority: "normal",
            relatedId: appointment.id.toString(),
          },
        });
      });

      /* Emails (post-commit) */
      if (appointment.patient?.email) {
        await sendMissedCallEmail({
          to: appointment.patient.email,
          recipientName: appointment.patient.first_name,
          counterpartName: appointment.doctor.name,
          role: "PATIENT",
          appointmentTime: appointment.appointment_date,
          rescheduleLink: `/appointments/reschedule/${appointment.id}`,
        });
      }

      if (appointment.doctor?.email) {
        await sendMissedCallEmail({
          to: appointment.doctor.email,
          recipientName: appointment.doctor.name,
          counterpartName: appointment.patient.first_name,
          role: "DOCTOR",
          appointmentTime: appointment.appointment_date,
          rescheduleLink: `/appointments/reschedule/${appointment.id}`,
        });
      }
    }

    /* =========================
       DOCTOR MISSED CALLS
    ========================= */
    const doctorMissedThreshold = new Date(
      now - DOCTOR_MISSED_MINUTES * 60 * 1000
    );

    const doctorMissedAppointments = await prisma.appointment.findMany({
      where: {
        type: AppointmentType.VIDEO,
        status: AppointmentStatus.SCHEDULED,
        appointment_date: { lt: doctorMissedThreshold },
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    for (const appointment of doctorMissedAppointments) {
      await prisma.$transaction(async (tx) => {
        const alreadyHandled = await tx.notification.findFirst({
          where: {
            relatedId: appointment.id.toString(),
            type: "appointment",
            title: "Doctor Missed Consultation",
          },
        });
        if (alreadyHandled) return;

        await tx.appointment.update({
          where: { id: appointment.id },
          data: { status: AppointmentStatus.MISSED },
        });

        await tx.notification.create({
          data: {
            userId: appointment.doctorId,
            userRole: Role.DOCTOR,
            title: "Missed Video Consultation",
            message: `You missed your scheduled video consultation with ${appointment.patient.first_name}.`,
            type: "appointment",
            priority: "high",
            relatedId: appointment.id.toString(),
          },
        });

        await tx.notification.create({
          data: {
            userId: appointment.patientId,
            userRole: Role.PATIENT,
            title: "Doctor Missed Consultation",
            message: `Dr. ${appointment.doctor.name} did not join the scheduled video consultation.`,
            type: "appointment",
            priority: "normal",
            relatedId: appointment.id.toString(),
          },
        });
      });

      /* Emails */
      if (appointment.doctor?.email) {
        await sendMissedCallEmail({
          to: appointment.doctor.email,
          recipientName: appointment.doctor.name,
          counterpartName: appointment.patient.first_name,
          role: "DOCTOR",
          appointmentTime: appointment.appointment_date,
          rescheduleLink: `/appointments/reschedule/${appointment.id}`,
        });
      }

      if (appointment.patient?.email) {
        await sendMissedCallEmail({
          to: appointment.patient.email,
          recipientName: appointment.patient.first_name,
          counterpartName: appointment.doctor.name,
          role: "PATIENT",
          appointmentTime: appointment.appointment_date,
          rescheduleLink: `/appointments/reschedule/${appointment.id}`,
        });
      }
    }

    

    return NextResponse.json({
      success: true,
      checkedBy: userId,
      patientMissed: patientMissedAppointments.length,
      doctorMissed: doctorMissedAppointments.length,
    });
  } catch (error) {
    console.error("Missed call detection error:", error);
    return NextResponse.json(
      { error: "Failed to process missed calls" },
      { status: 500 }
    );
  }
}
