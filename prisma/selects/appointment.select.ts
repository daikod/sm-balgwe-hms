import { Prisma } from "@prisma/client";

export const appointmentSelect = {
  id: true,
  appointment_date: true,
  time: true,
  status: true,
  type: true,
  roomID: true,
  duration: true,

  patient: {
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      phone: true,
      img: true,
      colorCode: true,
    },
  },

  doctor: {
    select: {
      id: true,
      name: true,
      specialization: true,
      img: true,
      colorCode: true,
    },
  },
} satisfies Prisma.AppointmentSelect;
