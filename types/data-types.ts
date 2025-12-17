// types/data-types.ts

export type ID = string | number;

export type Nullable<T> = T | null;

export type ApiResponse<T = unknown> = {
  success: boolean;
  msg: string;
  data?: T;
  error?: string;
};

// in @/types/data-types.ts
export interface Days {
  day: string;
  start_time: string;
  close_time: string;
}

export interface AvailableDoctorProps {
  id: string;
  name: string;
  specialization: string;
  img?: string | null;
  colorCode?: string | null;
  working_days: Days[];
}

export interface AppointmentsChartProps {
  name: string;
  appointment: number;
  completed: number;
}



