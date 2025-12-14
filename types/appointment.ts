

export type AppointmentStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type PatientInfo = {
  id: string;
  first_name: string;
  last_name: string;
  img?: string | null;
  gender: string;
  colorCode?: string | null;
};

export type DoctorInfo = {
  id: string;
  name: string;
  gender: string;
  specialization: string;
  img?: string | null;
  colorCode?: string | null;

};

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
