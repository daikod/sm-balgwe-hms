import { Gender } from "@prisma/client";

/**
 * Patient Data Transfer Object
 * Matches what BookAppointmentButton and PatientDashboardClient expect
 */
export type PatientDTO = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  img: string | null;
  gender: Gender;

  phone: string;
  address: string;
  date_of_birth: Date;
  marital_status: string;

  emergency_contact_name: string;
  emergency_contact_number: string;
  relation: string;

  blood_group: string | null;
  allergies: string | null;
  medical_conditions: string | null;
  medical_history: string | null;
  vitals: JSON | null;

  insurance_provider: string | null;
  insurance_number: string | null;

  privacy_consent: boolean;
  service_consent: boolean;
  medical_consent: boolean;

  colorCode: string | null;

  created_at: Date;
  updated_at: Date;
};
