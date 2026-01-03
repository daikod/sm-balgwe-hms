"use server";

import { VitalSignsFormData } from "@/components/dialogs/add-vital-signs";
import db   from "@/lib/db";
import { AppointmentSchema, VitalSignsSchema } from "@/lib/schema";
import { auth } from "@clerk/nextjs/server";
import { generateRoomId } from "@/lib/utils/generateRoomId";
import { revalidatePath } from "next/cache";
import { AppointmentStatus } from "@prisma/client";

export async function createNewAppointment(data: any) {
  try {
    const validatedData = AppointmentSchema.safeParse(data);

    if (!validatedData.success) {
      return { success: false, msg: "Invalid data" };
    }
    const validated = validatedData.data;

    // ✅ NEW: Determine appointment mode (default to IN_PERSON if not provided)
    const appointmentMode =
  data.appointmentMode === "VIDEO" ? "VIDEO" : "PHYSICAL";


    // ✅ NEW: Generate roomID only for video calls
    const roomID = appointmentMode === "VIDEO" ? generateRoomId() : "";


    // ✅ NEW: Combine date and time for scheduledAT
    const appointmentDateTime = new Date(validated.appointment_date);

    // Create appointment with video call support
    const { userId } = await auth();
    if (!userId) {
      return { success: false, msg: "Unauthorized" };
    }

    const appointment = await db.appointment.create({
  data: {
    roomID,
    patientId: userId,
    doctorId: validated.doctor_id,
    appointment_date: appointmentDateTime,
    scheduledAT: appointmentDateTime,
    time: validated.time,
    status: "SCHEDULED",
    duration: 30,
    type: appointmentMode, // ✅ VIDEO | PHYSICAL only
    reason: validated.type,
    note: validated.note,
  },
  include: {
    patient: true,
    doctor: true,
  },
});


    // ✅ FIXED: Check if patient exists before creating notification
    try {
      const patientExists = await db.patient.findUnique({
        where: { id: userId },
        select: { id: true }
      });

      if (patientExists) {
        await db.notification.create({
          data: {
            userId: data.patientId,
            userRole: "PATIENT",
            title: "Appointment Scheduled",
            message: `Your ${
              appointmentMode === "VIDEO" ? "video" : "in-person"
            } appointment with Dr. ${appointment.doctor.name} is scheduled for ${validated.appointment_date} at ${validated.time}`,
            type: "APPOINTMENT",
            category: "BOOKING",
            relatedId: appointment.id.toString(),
            relatedType: "APPOINTMENT",
            actionUrl:
              appointmentMode === "VIDEO"
                ? `/meeting/${roomID}`
                : `/appointments/${appointment.id}`,
            actionLabel:
              appointmentMode === "VIDEO" ? "Join Video Call" : "View Details",
            priority: "high",
          },
        });
      } else {
        console.log("Patient not found, skipping notification");
      }
    } catch (notificationError) {
      // Log but don't fail the appointment creation
      console.log("Notification creation failed:", notificationError);
    }

    // ✅ NEW: Revalidate paths to refresh appointment lists
    revalidatePath("/patient/appointments");
    revalidatePath("/doctor/appointments");
    revalidatePath("/admin/appointments");

    return {
      success: true,
      message: "Appointment booked successfully",
      appointment, // ✅ NEW: Return appointment data
    };
  } catch (error) {
    console.log(error);
    return { success: false, msg: "Internal Server Error" };
  }
}

export async function appointmentAction(
  id: string | number,
  status: AppointmentStatus,
  reason: string
) {
  try {
    await db.appointment.update({
      where: { id: Number(id) },
      data: {
        status,
        reason,
      },
    });

    // ✅ NEW: Revalidate paths after status change
    revalidatePath("/patient/appointments");
    revalidatePath("/doctor/appointments");
    revalidatePath("/admin/appointments");

    return {
      success: true,
      error: false,
      msg: `Appointment ${status.toLowerCase()} successfully`,
    };
  } catch (error) {
    console.log(error);
    return { success: false, msg: "Internal Server Error" };
  }
}

export async function addVitalSigns(
  data: VitalSignsFormData,
  appointmentId: string,
  doctorId: string
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, msg: "Unauthorized" };
    }

    const validatedData = VitalSignsSchema.parse(data);

    // Ensure we create a medical record if none exists
    let medicalRecord = null;
    if (!validatedData.medical_id) {
      medicalRecord = await db.medicalRecords.create({
        data: {
          patientId: validatedData.patient_id, // Prisma expects patientId
          appointmentId: Number(appointmentId),
          doctorId: doctorId,
        },
      });
    }

    const med_id = validatedData.medical_id || medicalRecord?.id;

    await db.vitalSigns.create({
      data: {
        patientId: validatedData.patient_id, // <-- map correctly
        medicalId: Number(med_id!),          // <-- already mapped
        body_temperature: validatedData.body_temperature,
        heartRate: validatedData.heartRate,
        systolic: validatedData.systolic,
        diastolic: validatedData.diastolic,
        weight: validatedData.weight,
        height: validatedData.height,
        respiratory_rate: validatedData.respiratory_rate,
        oxygen_saturation: validatedData.oxygen_saturation,
      },
    });

    return {
      success: true,
      msg: "Vital signs added successfully",
    };
  } catch (error) {
    console.log(error);
    return { success: false, msg: "Internal Server Error" };
  }
}
