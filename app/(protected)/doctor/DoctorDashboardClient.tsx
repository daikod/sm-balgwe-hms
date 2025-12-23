'use client';

import AppointmentCard from '@/components/AppointmentCard';
import { StatCard } from '@/components/stat-card';
import { AppointmentChart } from '@/components/charts/appointment-chart';
import { StatSummary } from '@/components/charts/stat-summary';
import { RecentAppointments } from '@/components/tables/recent-appointment';
import { AvailableDoctors } from '@/components/available-doctor';
import { BriefcaseBusiness, BriefcaseMedical, User, Users } from 'lucide-react';
import { useEffect } from 'react';

interface Props {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string;
  };
  appointmentCounts: Record<string, number>;
  totalAppointments: number;
  totalPatients: number;
  availableDoctors: any[];
  monthlyData: { name: string; appointment: number; completed: number }[];
  last5Records: any[];
}

export function DoctorDashboardClient({
  user,
  appointmentCounts,
  totalAppointments,
  totalPatients,
  availableDoctors,
  monthlyData,
  last5Records,
}: Props) {
  const cardData = [
    {
      title: 'Patients',
      value: totalPatients,
      icon: Users,
      note: 'Total patients',
      link: '/record/patients',
      className: 'bg-blue-800',
      iconClassName: 'bg-blue-600/25 text-blue-600',
    },
    {
      title: 'Appointments',
      value: totalAppointments,
      icon: BriefcaseBusiness,
      note: 'Total appointments',
      link: '/record/appointments',
      className: 'bg-purple-800',
      iconClassName: 'bg-yellow-600/25 text-yellow-600',
    },
    {
      title: 'Completed',
      value: appointmentCounts.COMPLETED,
      icon: BriefcaseMedical,
      note: 'Completed consultations',
      link: '/record/appointments',
      className: 'bg-emerald-800',
      iconClassName: 'bg-emerald-600/25 text-emerald-600',
    },
  ];

  useEffect(() => {
    fetch('/api/appointments/check-missed', { method: 'POST' });
  }, []);

  const handleStartCall = async (appointmentId: string, patientEmail: string) => {
    window.location.href = `/video/${appointmentId}`;
  };

  return (
    <div className="rounded-xl py-6 px-3 flex flex-col xl:flex-row gap-6">
      {/* LEFT */}
      <div className="w-full xl:w-[69%]">
        <div className="bg-gray-200 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg xl:text-2xl font-bold text-blue-950">
              Welcome, Dr. {user.firstName}
            </h1>
          </div>

          <div className="w-full flex flex-wrap gap-2">
            {cardData.map((el, idx) => (
              <StatCard key={idx} {...el} />
            ))}
          </div>
        </div>

        {/* Appointment Chart */}
        <div className="h-125 mb-8">
          <AppointmentChart data={monthlyData} />
        </div>

        {/* Recent Appointments Table */}
        <div className="bg-white rounded-xl p-4 mt-8">
          <RecentAppointments
            data={last5Records}
            userId={user.id}
            isAdmin={false}
            onStartCall={handleStartCall}
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-[30%] flex flex-col gap-8">
        <div className="w-full h-112.5">
          <StatSummary data={appointmentCounts} total={totalAppointments} />
        </div>

        <AvailableDoctors data={availableDoctors} />
      </div>
    </div>
  );
}
