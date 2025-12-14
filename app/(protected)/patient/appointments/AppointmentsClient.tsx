"use client";

import AppointmentCard from "@/components/AppointmentCard";
import EmptyAppointmentsClient from "./EmptyAppointmentsClient";
import type { Appointment } from "@/types/appointment";

interface Props {
  appointments: Appointment[];
  userRole: "PATIENT";
}

export default function AppointmentsClient({ appointments, userRole }: Props) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Appointments
        </h1>
        <p className="text-gray-600">
          View and join your scheduled consultations
        </p>
      </div>

      {appointments.length === 0 ? (
        <EmptyAppointmentsClient />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((appointment: Appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              userRole={userRole}
            />
          ))}
        </div>
      )}
    </div>
  );
}
