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
import { Gender } from '@prisma/client';
import { Appointment } from '@/types/appointment';

interface PatientDTO {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  img?: string | null;
  date_of_birth?: string | Date;
  gender?: string;
  marital_status?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_number?: string | null;
  relation?: string | null;
  blood_group?: string | null;
  allergies?: string | null;
  medical_conditions?: string | null;
  medical_history?: string | null;
  insurance_provider?: string | null;
  insurance_number?: string | null;
  privacy_consent?: boolean;
  service_consent?: boolean;
  medical_consent?: boolean;
  colorCode?: string | null;
  created_at?: string | Date;
  updated_at?: string | Date;
}

interface PatientDashboardClientProps {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    imageUrl: string;
  };
  patientData: PatientDTO;
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

  /* ✅ FIX: normalization moved INSIDE component */
  const normalizedPatientForBooking = {
    id: patientData.id,
    first_name: patientData.first_name,
    last_name: patientData.last_name,
    address: patientData.address ?? '',
    img: patientData.img ?? null,
    date_of_birth: patientData.date_of_birth
      ? new Date(patientData.date_of_birth)
      : new Date(),
    gender: (patientData.gender as Gender) ?? Gender.MALE,
    phone: patientData.phone ?? '',
    email: patientData.email,
    marital_status: patientData.marital_status ?? '',
    emergency_contact_name: patientData.emergency_contact_name ?? '',
    emergency_contact_number: patientData.emergency_contact_number ?? '',
    relation: patientData.relation ?? '',
    blood_group: patientData.blood_group ?? null,
    allergies: patientData.allergies ?? null,
    medical_conditions: patientData.medical_conditions ?? null,
    medical_history: patientData.medical_history ?? null,
    insurance_provider: patientData.insurance_provider ?? null,
    insurance_number: patientData.insurance_number ?? null,
    privacy_consent: patientData.privacy_consent ?? false,
    service_consent: patientData.service_consent ?? false,
    medical_consent: patientData.medical_consent ?? false,
    colorCode: patientData.colorCode ?? null,
    created_at: patientData.created_at
      ? new Date(patientData.created_at)
      : new Date(),
    updated_at: patientData.updated_at
      ? new Date(patientData.updated_at)
      : new Date(),
  };

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
      doctorName: 'Doctor Name',
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
    fetch('/api/appointments/check-missed', { method: 'POST' });
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
                patientData={normalizedPatientForBooking}
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
      </div>

      {isDoctorJoined && (
        <div className="fixed top-0 left-0 right-0 bg-green-600 text-white p-4 text-center">
          <p>The doctor has joined the video call! Join now.</p>
        </div>
      )}
    </div>
  );
};

export { PatientDashboardClient };
