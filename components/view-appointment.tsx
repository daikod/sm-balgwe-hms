// components/view-appointment.tsx (Server Component - NO "use client")
import { getAppointmentById } from "@/utils/services/appointment";
import React from "react";
import { auth } from "@clerk/nextjs/server";
import { checkRole } from "@/utils/roles";
import ViewAppointmentDialog from "./view-appointment-dialog";

export const ViewAppointment = async ({ id }: { id: string | undefined }) => {
  const { data } = await getAppointmentById(Number(id!));
  const { userId } = await auth();
  const isAdmin = await checkRole("ADMIN");

  if (!data) return null;

  return (
    <ViewAppointmentDialog 
      data={data} 
      userId={userId} 
      isAdmin={isAdmin}
    />
  );
};