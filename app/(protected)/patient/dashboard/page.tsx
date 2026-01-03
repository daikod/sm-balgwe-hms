import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import {
  getPatientById,
  getPatientDashboardStatistics,
} from "@/utils/services/patient";
import { getDoctors } from "@/utils/services/doctor";

import { Appointment, AppointmentStatus } from "@/types/appointment";
import PatientDashboardClient from "./PatientDashboardClient";
import { Gender, Status } from "@prisma/client";

const PatientDashboardServer = async () => {
  const user = await currentUser();
  if (!user?.id) redirect("/sign-in");

  /** Fetch patient & doctors */
  const { data: patientData } = await getPatientById(user.id);
  if (!patientData) redirect("/patient/onboarding");

  const { data: doctors = [] } = await getDoctors();

  const {
    data,
    appointmentCounts,
    last5Records,
    totalAppointments,
    monthlyData,
  } = await getPatientDashboardStatistics(user.id);
  if (!data) return null;

  /** Normalize Clerk user */
  const plainUserData = {
    id: user.id,
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.primaryEmailAddress?.emailAddress ?? "",
    imageUrl: user.imageUrl ?? "",
  };

  /** Normalize patient for client */
  const plainPatientData = {
  id: patientData.id,
  first_name: patientData.first_name,
  last_name: patientData.last_name,
  email: patientData.email,
  phone: patientData.phone ?? "",
  address: patientData.address ?? "",
  img: patientData.img ?? null,
  date_of_birth: patientData.date_of_birth ?? new Date(),
  gender:
    patientData.gender === "FEMALE"
      ? Gender.FEMALE
      : patientData.gender === "MALE"
      ? Gender.MALE
      : Gender.MALE,
  marital_status: patientData.marital_status ?? "",
  emergency_contact_name: patientData.emergency_contact_name ?? "",
  emergency_contact_number: patientData.emergency_contact_number ?? "",
  relation: patientData.relation ?? "",
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
  created_at: patientData.created_at ?? new Date(),
  updated_at: patientData.updated_at ?? new Date(),

  doctorId: patientData.doctorId ?? null,
  status:
    patientData.status === Status.INACTIVE
      ? Status.INACTIVE
      : Status.ACTIVE,

  onboarded: patientData.onboarded ?? true,

  // ✅ REQUIRED BY PatientDTO
  vitals: {
    temperature: undefined,
    bloodPressure: undefined,
    heartRate: undefined,
    respiratoryRate: undefined,
  },
};


  /** Normalize appointments */
  const mappedAppointments: Appointment[] = last5Records.map((a: any) => ({
  id: a.id,
  roomID: a.roomID ?? undefined,
  appointment_date: a.appointment_date,
  time: a.time ?? undefined,
  duration: a.duration ?? undefined,
  status: a.status as AppointmentStatus, // ✅ cast to AppointmentStatus
  type: a.type,

  patient: a.patient
    ? {
        id: a.patient.id,
        first_name: a.patient.first_name,
        last_name: a.patient.last_name,
        email: a.patient.email ?? "",
        phone: a.patient.phone ?? "",
        address: a.patient.address ?? "",
        img: a.patient.img ?? null,
        date_of_birth: a.patient.date_of_birth ?? null,
        gender: a.patient.gender ?? "MALE",
        marital_status: a.patient.marital_status ?? "",
        emergency_contact_name: a.patient.emergency_contact_name ?? "",
        emergency_contact_number: a.patient.emergency_contact_number ?? "",
        relation: a.patient.relation ?? "",
        blood_group: a.patient.blood_group ?? null,
        allergies: a.patient.allergies ?? null,
        medical_conditions: a.patient.medical_conditions ?? null,
        medical_history: a.patient.medical_history ?? null,
        insurance_provider: a.patient.insurance_provider ?? null,
        insurance_number: a.patient.insurance_number ?? null,
        privacy_consent: a.patient.privacy_consent ?? false,
        service_consent: a.patient.service_consent ?? false,
        medical_consent: a.patient.medical_consent ?? false,
        colorCode: a.patient.colorCode ?? null,
        created_at: a.patient.created_at ?? new Date(),
        updated_at: a.patient.updated_at ?? new Date(),
        doctorId: a.patient.doctorId ?? null,
        status: a.patient.status ?? "ACTIVE",       // ✅ patient status is fine here
        onboarded: a.patient.onboarded ?? true,

      }
    : null,

  doctor: a.doctor
    ? {
        id: a.doctor.id,
        name: a.doctor.name,
        specialization: a.doctor.specialization,
        img: a.doctor.img ?? null,
        colorCode: a.doctor.colorCode ?? null,
      }
    : null,
}));

  /** Normalize doctors for all components */
  const normalizedDoctors = doctors.map((d: any) => ({
    id: d.id,
    name: d.name,
    email: d.email ?? "",
    phone: d.phone ?? "",
    address: d.address ?? "",
    img: d.img ?? null,
    colorCode: d.colorCode ?? null,
    created_at: d.created_at ? new Date(d.created_at) : new Date(),
    updated_at: d.updated_at ? new Date(d.updated_at) : new Date(),
    specialization: d.specialization ?? "",
    license_number: d.license_number ?? "",
    department: d.department ?? null,
    availability_status: d.availability_status ?? null,
    type: d.type,
    working_days: d.working_days ?? [],
  }));

  /** Render client */
  return (
    <PatientDashboardClient
      user={plainUserData}
      patientData={plainPatientData}
      doctors={normalizedDoctors}
      data={data}
      appointmentCounts={appointmentCounts}
      last5Records={mappedAppointments}
      totalAppointments={totalAppointments}
      monthlyData={monthlyData}
    />
  );
};

export default PatientDashboardServer;
