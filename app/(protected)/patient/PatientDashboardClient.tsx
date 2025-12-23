// app/(protected)/patient/PatientDashboardClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, BriefcaseBusiness, BriefcaseMedical } from 'lucide-react';

import { AvailableDoctors } from '@/components/available-doctor';
import { AppointmentChart } from '@/components/charts/appointment-chart';
import { StatSummary } from '@/components/charts/stat-summary';
import { StatCard } from '@/components/stat-card';
import { RecentAppointments } from '@/components/tables/recent-appointment';
import { BookAppointmentButton } from '@/components/patient/book-appointment-button';
import { Button } from '@/components/ui/button';
import { sendVideoCallStartedEmail } from '@/utils/email';

import { Appointment } from '@/types/appointment';
import { Patient } from '@prisma/client';

interface PatientDashboardClientProps {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    imageUrl: string;
  };
  patientData: Patient;
  doctors: any[];
  data: any;
  appointmentCounts: any;
  last5Records: Appointment[];
  totalAppointments: number;
  monthlyData: any;
}

const PatientDashboardClient: React.FC<PatientDashboardClientProps> = ({
  user,
  patientData,
  doctors,
  data,
  appointmentCounts,
  last5Records,
  totalAppointments,
  monthlyData,
}) => {
  const [isDoctorJoined, setIsDoctorJoined] = useState(false);

  useEffect(() => {
    last5Records.forEach((appointment) => {
      if (appointment.status === 'IN_PROGRESS') {
        setIsDoctorJoined(true);
      }
    });
  }, [last5Records]);

  const handleStartConsultation = async (
    appointmentId: string,
    patientEmail: string
  ) => {
    await sendVideoCallStartedEmail({
      to: patientEmail,
      patientName: patientData.first_name,
      doctorName: 'Doctor Name', // can be made dynamic later
      roomID: `appointment-${appointmentId}`,
    });
  };

  const cardData = [
    {
      title: 'Appointments',
      value: totalAppointments,
      icon: Briefcase,
      className: 'bg-blue-800',
      iconClassName: 'bg-blue-950/25 text-blue-600',
      note: 'Total appointments',
      link: '/record/appointments',
    },
    {
      title: 'Cancelled',
      value: appointmentCounts?.CANCELLED || 0,
      icon: Briefcase,
      className: 'bg-rose-800',
      iconClassName: 'bg-rose-950/25 text-rose-600',
      note: 'Cancelled appointments',
      link: '/record/appointments',
    },
    {
      title: 'Pending',
      value:
        (appointmentCounts?.PENDING || 0) +
        (appointmentCounts?.SCHEDULED || 0),
      icon: BriefcaseBusiness,
      className: 'bg-yellow-800',
      iconClassName: 'bg-yellow-600/25 text-yellow-600',
      note: 'Pending appointments',
      link: '/record/appointments',
    },
    {
      title: 'Completed',
      value: appointmentCounts?.COMPLETED || 0,
      icon: BriefcaseMedical,
      className: 'bg-emerald-800',
      iconClassName: 'bg-emerald-600/25 text-emerald-600',
      note: 'Completed appointments',
      link: '/record/appointments',
    },
  ];

    useEffect(() => {
      fetch("/api/appointments/check-missed", {
        method: "POST",
      });
    }, []);

  return (
    <div className="py-6 px-3 flex flex-col rounded-xl xl:flex-row gap-6">
      {/* LEFT */}
      <div className="w-full xl:w-[69%]">
        <div className="bg-white rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg xl:text-2xl font-semibold text-blue-950">
              Welcome {data.first_name || user.firstName}
            </h1>

            <div className="space-x-2 flex items-center">
              <BookAppointmentButton
                patientData={patientData}
                doctors={doctors}
              />
              <Button size="sm">{new Date().getFullYear()}</Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/patient/self">View Profile</Link>
              </Button>
            </div>
          </div>

          <div className="w-full flex flex-wrap gap-5">
            {cardData.map((el, idx) => (
              <StatCard key={idx} {...el} />
            ))}
          </div>
        </div>

        <div className="h-125">
          <AppointmentChart data={monthlyData} />
        </div>

        <div className="bg-white rounded-xl p-4 mt-8">
          <RecentAppointments
            data={last5Records}
            userId={user.id}
            isAdmin={false}
            onStartCall={handleStartConsultation}
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-[30%]">
        <div className="w-full h-112.5 mb-8">
          <StatSummary data={appointmentCounts} total={totalAppointments} />
        </div>

        <AvailableDoctors data={doctors} />

        <div className="mt-6">
          <p className="text-sm text-gray-500">
            Patient ratings coming soon
          </p>
        </div>
      </div>

      {/* In-App Banner */}
      {isDoctorJoined && (
        <div className="fixed top-0 left-0 right-0 bg-green-600 text-white p-4 text-center">
          <p>The doctor has joined the video call! Join now.</p>
        </div>
      )}
    </div>
  );
};

export { PatientDashboardClient };
