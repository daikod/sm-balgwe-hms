import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { AppointmentStatus } from "@prisma/client";
import { sendMissedCallEmail } from "@/utils/email";

const PATIENT_MISSED_MINUTES = 5;
const DOCTOR_MISSED_MINUTES = 5;

export async function POST() {
  try {
    /**
     * =========================
     * PATIENT MISSED CALLS
     * =========================
     */
    const patientMissedThreshold = new Date(
      Date.now() - PATIENT_MISSED_MINUTES * 60 * 1000
    );

    const patientMissedAppointments = await prisma.appointment.findMany({
      where: {
        status: AppointmentStatus.IN_PROGRESS,
        updated_at: { lt: patientMissedThreshold },
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    for (const appointment of patientMissedAppointments) {
      // Prevent duplicate notifications
      const alreadyNotified = await prisma.notification.findFirst({
        where: {
          userId: appointment.patient_id,
          title: "Missed Video Consultation",
          actionUrl: `/video/${appointment.roomID}`,
        },
      });

      if (alreadyNotified) continue;

      // Cancel appointment
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          status: AppointmentStatus.CANCELLED,
        },
      });

      // Notify patient
      await prisma.notification.create({
        data: {
          userId: appointment.patient_id,
          userRole: "PATIENT",
          title: "Missed Video Consultation",
          message: `You missed your video consultation with Dr. ${appointment.doctor.name}.`,
          type: "appointment",
          priority: "high",
          actionUrl: `/video/${appointment.roomID}`,
        },
      });

      // Notify doctor
      await prisma.notification.create({
        data: {
          userId: appointment.doctor_id,
          userRole: "DOCTOR",
          title: "Patient Missed Consultation",
          message: `${appointment.patient.first_name} did not join the scheduled video consultation.`,
          type: "appointment",
          priority: "normal",
          actionUrl: `/video/${appointment.roomID}`,
        },
      });

      // Send emails
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

    /**
     * =========================
     * DOCTOR MISSED CALLS
     * =========================
     */
    const doctorMissedThreshold = new Date(
      Date.now() - DOCTOR_MISSED_MINUTES * 60 * 1000
    );

    const doctorMissedAppointments = await prisma.appointment.findMany({
      where: {
        status: AppointmentStatus.SCHEDULED,
        appointment_date: { lt: doctorMissedThreshold },
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    for (const appointment of doctorMissedAppointments) {
      const alreadyNotified = await prisma.notification.findFirst({
        where: {
          userId: appointment.doctor_id,
          title: "Missed Video Consultation",
          actionUrl: `/video/${appointment.roomID}`,
        },
      });

      if (alreadyNotified) continue;

      // Cancel appointment
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          status: AppointmentStatus.CANCELLED,
        },
      });

      // Notify doctor
      await prisma.notification.create({
        data: {
          userId: appointment.doctor_id,
          userRole: "DOCTOR",
          title: "Missed Video Consultation",
          message: `You missed your scheduled video consultation with ${appointment.patient.first_name}.`,
          type: "appointment",
          priority: "high",
          actionUrl: `/video/${appointment.roomID}`,
        },
      });

      // Notify patient
      await prisma.notification.create({
        data: {
          userId: appointment.patient_id,
          userRole: "PATIENT",
          title: "Doctor Missed Consultation",
          message: `Dr. ${appointment.doctor.name} did not join the scheduled video consultation.`,
          type: "appointment",
          priority: "normal",
          actionUrl: `/video/${appointment.roomID}`,
        },
      });

      // Send emails
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
