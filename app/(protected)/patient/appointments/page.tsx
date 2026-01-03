import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import AppointmentsClient from "./AppointmentsClient";

export default async function PatientAppointmentsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const appointments = await db.appointment.findMany({
    where: {
      patientId: userId,
      status: {
        in: ["PENDING", "READY_FOR_ADMISSION", "MISSED"],
      },
    },
    include: {
      patient: true,
      doctor: true,
    },
    orderBy: {
      appointment_date: "asc",
    },
  });

  // ✅ ONLY normalize null → undefined (do NOT change id type)
  const safeAppointments = appointments.map((a) => ({
    ...a,
    patient: a.patient
      ? {
          ...a.patient,
          doctorId: a.patient.doctorId ?? undefined,
          img: a.patient.img ?? undefined,
        }
      : undefined,
    doctor: a.doctor
      ? {
          ...a.doctor,
          img: a.doctor.img ?? undefined,
        }
      : undefined,
  }));

  return (
    <AppointmentsClient
      appointments={safeAppointments}
      userRole="PATIENT"
    />
  );
}
