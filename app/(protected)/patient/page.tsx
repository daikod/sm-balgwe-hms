// app/(protected)/patient/page.tsx (or equivalent)

// Import necessary types
import { Appointment, DoctorInfo } from '@/types/appointment';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import {
  getPatientById,
  getPatientDashboardStatistics,
} from '@/utils/services/patient';

import { getDoctors } from '@/utils/services/doctor';
import { PatientDashboardClient } from './PatientDashboardClient';

const PatientDashboardServer = async () => {
  const user = await currentUser();
  if (!user?.id) redirect('/sign-in');

  /** ----------------------------
   * Fetch server-side data
   * ---------------------------- */
  const { data: patientData } = await getPatientById(user.id);
  const { data: doctors = [] } = await getDoctors();
  const {
    data,
    appointmentCounts,
    last5Records,
    totalAppointments,
    monthlyData,
  } = await getPatientDashboardStatistics(user.id);

  if (!data || !patientData) return null;

  /** ----------------------------
   * Normalize Clerk user
   * ---------------------------- */
  const plainUserData = {
    id: user.id,
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    email: user.primaryEmailAddressId ?? '',
    imageUrl: user.imageUrl ?? '',
  };

  /** ----------------------------
   * Trim patient payload (NO Prisma objects)
   * ---------------------------- */
  const plainPatientData = {
    id: patientData.id,
    first_name: patientData.first_name,
    last_name: patientData.last_name,
    email: patientData.email,
    phone: patientData.phone ?? '',
    address: patientData.address ?? '',
    img: patientData.img ?? null,
    date_of_birth: patientData.date_of_birth,
    gender: patientData.gender,
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
    created_at: patientData.created_at,
    updated_at: patientData.updated_at,
  };

  /** ----------------------------
   * Normalize appointments for UI
   * ---------------------------- */
  const mappedAppointments: Appointment[] = last5Records.map((a: any) => ({
    id: a.id,
    roomID: a.roomID ?? undefined,
    appointment_date: a.appointment_date,
    time: a.time ?? undefined,
    duration: a.duration ?? undefined,
    status: a.status as Appointment['status'],
    type: (a.type as Appointment['type']) ?? 'PHYSICAL',

    patient: a.patient
      ? {
          id: a.patient.id,
          first_name: a.patient.first_name,
          last_name: a.patient.last_name,
          email: a.patient.email ?? '',
          gender: a.patient.gender ?? 'MALE',
          img: a.patient.img ?? null,
          colorCode: a.patient.colorCode ?? null,
        }
      : null,

    doctor: a.doctor
      ? ({
          id: a.doctor.id,
          name: a.doctor.name,
          specialization: a.doctor.specialization,
          img: a.doctor.img ?? null,
          colorCode: a.doctor.colorCode ?? null,
        } as DoctorInfo)
      : null,
  }));


  /** ----------------------------
   * Render client component
   * ---------------------------- */
  return (
    <PatientDashboardClient
      user={plainUserData}
      patientData={plainPatientData}
      doctors={doctors}
      data={data}
      appointmentCounts={appointmentCounts}
      last5Records={mappedAppointments}
      totalAppointments={totalAppointments}
      monthlyData={monthlyData}
    />
  );
};

export default PatientDashboardServer;
