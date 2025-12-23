"use client";

import React from "react";
import { RecentAppointments } from "@/components/tables/recent-appointment";
import { Appointment } from "@/types/appointment";

interface Props {
  appointments: Appointment[];
  userId: string;
  isAdmin: boolean;
}

export const RecentAppointmentsWrapper = ({ appointments, userId, isAdmin }: Props) => {
  // Implement the required onStartCall handler
  const onStartCall = async (appointmentId: string, patientEmail: string) => {
    console.log("Starting call:", appointmentId, patientEmail);
    // Add real call logic here if needed
  };

  return (
    <RecentAppointments
      data={appointments}
      userId={userId}
      isAdmin={isAdmin}
      onStartCall={onStartCall}
    />
  );
};
