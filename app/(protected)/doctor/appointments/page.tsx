// app/(protected)/doctor/appointments/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  getDoctorAppointments,
  getDoctorDashboardStats,
} from "@/utils/services/doctor";
import { DoctorAppointmentsClient } from "./DoctorAppointmentsClient";

const DoctorAppointmentsPage = async () => {
  const user = await currentUser();
  if (!user?.id) redirect("/sign-in");

  const appointments = await getDoctorAppointments(user.id);
  const stats = await getDoctorDashboardStats(user.id);

  const plainUser = {
    id: user.id,
    firstName: user.firstName ?? "Doctor",
    lastName: user.lastName ?? "",
    email: user.primaryEmailAddressId ?? "",
    imageUrl: user.imageUrl ?? "",
  };

  // ✅ CANONICAL DTO
  const mappedAppointments = appointments.map((a: any) => ({
  id: String(a.id),
  type: a.type ?? 'PHYSICAL',
  status: a.status,
  roomID: a.roomID || '',
  appointment_date: a.appointment_date,
  patient: a.patient
    ? {
        first_name: a.patient.first_name,
        last_name: a.patient.last_name,
        img: a.patient.img ?? null,
      }
    : undefined,
}));

  return (
    <DoctorAppointmentsClient
      user={plainUser}
      stats={stats}
      appointments={mappedAppointments}
    />
  );
};

export default DoctorAppointmentsPage;
