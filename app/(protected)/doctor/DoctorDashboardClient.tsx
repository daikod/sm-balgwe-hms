'use client';

import React, { useEffect } from 'react';
import { StatCard } from '@/components/stat-card';
import { AppointmentChart } from '@/components/charts/appointment-chart';
import { StatSummary } from '@/components/charts/stat-summary';
import { RecentAppointments } from '@/components/tables/recent-appointment';
import { AvailableDoctors } from '@/components/available-doctor';
import { BriefcaseBusiness, BriefcaseMedical, User, Users, UsersRound } from 'lucide-react';

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
  totalAdmissions: number; // Active admissions count
  availableDoctors: any[];
  monthlyData: { name: string; appointment: number; completed: number }[];
  last5Records: any[];
  notifications: any[];
  unreadCount: number;
}

export function DoctorDashboardClient({
  user,
  appointmentCounts,
  totalAppointments,
  totalPatients,
  totalAdmissions,
  availableDoctors,
  monthlyData,
  last5Records,
  notifications,
  unreadCount,
}: Props) {
  // Define cardData for StatCards
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
      value: appointmentCounts.COMPLETED || 0,
      icon: BriefcaseMedical,
      note: 'Completed consultations',
      link: '/record/appointments',
      className: 'bg-emerald-800',
      iconClassName: 'bg-emerald-600/25 text-emerald-600',
    },
    {
      title: 'Active Admissions',
      value: totalAdmissions,
      icon: UsersRound,
      note: 'Currently admitted patients',
      link: '/doctor/admissions',
      className: 'bg-orange-800',
      iconClassName: 'bg-orange-600/25 text-orange-600',
    },
    {
      title: 'Admit Patient',
      value: undefined,
      icon: User,
      note: 'Admit a new patient',
      link: '/doctor/admissions/new',
      className: 'bg-teal-800',
      iconClassName: 'bg-teal-600/25 text-teal-600',
    },
  ];

  useEffect(() => {
    fetch('/api/appointments/check-missed', { method: 'POST' });
  }, []);

  const handleStartCall = async (appointmentId: string) => {
    window.location.href = `/video/${appointmentId}`;
  };

  return (
    <div className="rounded-xl py-6 px-3 flex flex-col xl:flex-row gap-6">
      {/* LEFT */}
      <div className="w-full xl:w-[69%]">
        {/* Welcome + StatCards */}
        <div className="bg-gray-200 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg xl:text-2xl font-bold text-blue-950">
              Welcome, Dr. {user.firstName} ({unreadCount} unread notifications)
            </h1>
          </div>
          <div className="w-full flex flex-wrap gap-2">
            {cardData.map((el, idx) => (
              <StatCard key={idx} {...el} />
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl p-4 mb-8">
          <h2 className="font-semibold mb-2">Notifications</h2>
          <ul>
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`p-2 rounded ${n.isRead ? '' : 'bg-yellow-100'}`}
              >
                <strong>{n.title}</strong>: {n.message}
              </li>
            ))}
          </ul>
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
