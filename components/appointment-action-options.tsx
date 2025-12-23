// components/appointment/appointment-action-options.tsx
import { auth } from "@clerk/nextjs/server";
import { checkRole } from "@/utils/roles";
import { AppointmentStatus } from "@prisma/client";
import AppointmentActionOptionsClient from "./appointment-action-options-client";

interface ActionsProps {
  appointmentId: number;
  patientId: string;
  doctorId: string;
  status: AppointmentStatus;
}

const AppointmentActionOptions = async ({
  appointmentId,
  patientId,
  doctorId,
  status,
}: ActionsProps) => {
  const user = await auth();
  const isAdmin = await checkRole("ADMIN");
  const isDoctor = user?.userId === doctorId;

  if (!user?.userId) return null;

  return (
    <AppointmentActionOptionsClient
      appointmentId={appointmentId}
      patientId={patientId}
      doctorId={doctorId}
      status={status}
      isAdmin={isAdmin}
      isDoctor={isDoctor}
      userId={user.userId}
    />
  );
};

export default AppointmentActionOptions;
