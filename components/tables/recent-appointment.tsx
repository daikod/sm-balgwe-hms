'use client'; // This component should run on the client side

import React from 'react';
import { Appointment } from '@/types/appointment';
import { ProfileImage } from '@/components/profile-image';
import { format } from 'date-fns';
import { AppointmentStatusIndicator } from '@/components/appointment-status-indicator';
import ViewAppointmentDialog from '@/components/view-appointment-dialog';
import Link from 'next/link';
import { Button } from '../ui/button';

interface DataProps {
  data: Appointment[];
  userId: string;
  isAdmin: boolean;
  onStartCall?: (appointmentId: string, patientEmail: string) => Promise<void>;
}

export const RecentAppointments = ({
  data,
  userId,
  isAdmin,
  onStartCall,
}: DataProps) => {
  const renderRow = (item: Appointment) => {
    const patientName =
      `${item.patient?.first_name ?? ''} ${item.patient?.last_name ?? ''}`.trim();
      

    const doctorName = item.doctor?.name ?? '';
    const patientImg = item.patient?.img ?? '';
    const doctorImg = item.doctor?.img ?? '';
    const patientBgColor = item.patient?.colorCode ?? 'bg-gray-400';
    const doctorBgColor = item.doctor?.colorCode ?? 'bg-gray-400';

    const patientGender =
      item.patient?.gender
        ? String(item.patient.gender).toLowerCase()
        : '';

    const patientEmail = item.patient?.email ?? ''; // Handle missing email
    const patientPhone = item.patient?.phone ?? ''; // Handle missing phone

    const isVideoAppointment = item.type === 'VIDEO';

    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50"
      >
        <td className="flex items-center gap-2 2xl:gap-4 py-2 xl:py-4">
          <ProfileImage
            url={patientImg}
            name={patientName || 'Unknown'}
            className="bg-violet-600"
            bgColor={patientBgColor}
          />
          <div>
            <h3 className="text-sm md:text-base md:font-medium uppercase">
              {patientName || 'Unknown'}
            </h3>
            <span className="text-xs capitalize">{patientGender}</span>
          </div>
        </td>

        <td className="hidden md:table-cell">
          {format(new Date(item.appointment_date), 'yyyy-MM-dd')}
        </td>

        <td className="hidden md:table-cell">{item.time}</td>

        <td className="hidden md:table-cell items-center py-2">
          <div className="flex items-center gap-2 2xl:gap-4">
            <ProfileImage
              url={doctorImg}
              name={doctorName || 'Unknown'}
              className="bg-blue-600"
              bgColor={doctorBgColor}
              textClassName="text-black font-medium"
            />
            <div>
              <h3 className="font-medium uppercase">
                {doctorName || 'Unknown'}
              </h3>
              <span className="text-xs capitalize">
                {item.doctor?.specialization ?? ''}
              </span>
            </div>
          </div>
        </td>

        <td className="hidden xl:table-cell">
          <AppointmentStatusIndicator status={item.status} />
        </td>

        <td>
          <div className="flex items-center gap-x-2">
            <ViewAppointmentDialog
              data={item}
              userId={userId}
              isAdmin={isAdmin}
            />

            <Link href={`/record/appointments/${item.id}`}>See all</Link>

            {isVideoAppointment && (
              <button
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md"
                onClick={() => {
                  if (onStartCall) {
                    onStartCall(String(item.id), patientEmail);
                  }
                }}
              >
                Start Call
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-xl p-2 2xl:p-4">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-lg font-semibold">Recent Appointments</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/record/appointments">View All</Link>
        </Button>
      </div>

      <table className="w-full table-auto border-collapse">
        <thead>
          <tr>
            <th>Info</th>
            <th className="hidden md:table-cell">Date</th>
            <th className="hidden md:table-cell">Time</th>
            <th className="hidden md:table-cell">Doctor</th>
            <th className="hidden xl:table-cell">Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{data.map(renderRow)}</tbody>
      </table>
    </div>
  );
};
