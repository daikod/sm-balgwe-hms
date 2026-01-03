import { AppointmentStatus, Gender } from "@prisma/client";

/**
 * Prisma-backed enum (single source of truth)
 */
export { AppointmentStatus };

/**
 * Patient projection for UI
 */
export type PatientInfo = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;  // required
  img?: string | null;
  gender: Gender;
  colorCode?: string | null;
};

/**
 * Full patient projection for dashboard/client usage
 */
export type PatientDTO = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  img?: string | null;
  date_of_birth: Date;
  gender: Gender;
  marital_status: string;
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
  doctor_id?: string | null;  // optional, needed for BookAppointmentButton
  status?: string;             // optional, needed for BookAppointmentButton
  doctorId?: string;           // optional
  created_at: Date;
  updated_at: Date;
};


/**
 * Doctor projection for UI
 */
export type DoctorInfo = {
  id?: string;
  name: string;
  gender?: string | null;
  specialization: string;
  img?: string | null;
  colorCode?: string | null;
};

/**
 * Appointment type aligned with Prisma schema
 */
export type Appointment = {
  id: number;
  roomID?: string; // optional to avoid TS errors
  appointment_date: Date;
  time?: string;
  status: AppointmentStatus;
  duration?: number;
  type: string;
  patient?: PatientDTO | null; // use PatientDTO for full patient info
  doctor?: DoctorInfo | null;
};

/**
 * Appointment type enum
 */
export enum AppointmentType {
  VIDEO = 'VIDEO',
  PHYSICAL = 'PHYSICAL',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'

}
