'use client';

import React from "react";
import AppointmentCard from "@/components/AppointmentCard";
import { StatSummary } from "@/components/charts/stat-summary";

interface DoctorAppointmentsClientProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string;
  };
  stats: any;
  appointments: any[];
}

export const DoctorAppointmentsClient: React.FC<DoctorAppointmentsClientProps> = ({
  user,
  stats,
  appointments,
}) => {
  return (
    <div className="py-6 px-3 flex flex-col xl:flex-row gap-6">
      {/* LEFT */}
      <div className="w-full xl:w-[70%]">
        <div className="bg-white rounded-xl p-4 mb-8">
          <h1 className="text-xl font-semibold mb-4">
            {user.firstName}'s Appointments
          </h1>

          {appointments.length === 0 ? (
            <p>No appointments scheduled.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.map((appt) => (
                <AppointmentCard
                  key={appt.id}
                  appointment={appt}
                  userRole="DOCTOR"
                  showVideoButton
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-[30%]">
        <div className="min-h-105">
            <StatSummary
            data={stats.appointmentCounts}
            total={stats.totalAppointment}
            />
        </div>
       </div>
    </div>
  );
};
