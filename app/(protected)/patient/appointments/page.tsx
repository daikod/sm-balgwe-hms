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
      patient_id: userId,
      status: {
        in: ["SCHEDULED", "IN_PROGRESS"],
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

  return (
    <AppointmentsClient
      appointments={appointments}
      userRole="PATIENT"
    />
  );
}
