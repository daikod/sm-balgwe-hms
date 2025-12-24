import { AppointmentStatus, AppointmentType } from "@prisma/client";

export interface AppointmentDTO {
  id: number;
  appointment_date: Date;
  time: string;
  status: AppointmentStatus;
  type: AppointmentType;
  roomID: string | null;
  duration: number;

  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
    img?: string | null;
    colorCode?: string | null;
  };

  doctor?: {
    id: string;
    name: string;
    specialization: string;
    img?: string | null;
    colorCode?: string | null;
  };
}
