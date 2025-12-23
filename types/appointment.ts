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
  email: string;  // Add this line
  img?: string | null;
  gender: Gender;
  colorCode?: string | null;
};

/**
 * Doctor projection for UI
 */
export type DoctorInfo = {
  id?: string;
  name: string;
  gender?: string | null; // ✅ optional
  specialization: string;
  img?: string | null;
  colorCode?: string | null;
};

/**
 * Appointment type aligned with Prisma schema
 */
export type Appointment = {
  id: number;
  roomID: string;
  appointment_date: Date;
  time: string;
  status: AppointmentStatus;
  duration: number;
  type: string;
  patient?: PatientInfo | null;
  doctor?: DoctorInfo | null;
};

export enum AppointmentType {
  VIDEO = 'VIDEO',
  PHYSICAL = 'PHYSICAL',
}

