import db from "@/lib/db";
import { Prisma } from "@prisma/client";
import { nanoid } from "nanoid";

export type AppointmentType = "PHYSICAL" | "VIDEO";
export type AppointmentStatus = "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED";

interface CreateAppointmentProps {
  patient_id: string;
  doctor_id: string;
  appointment_date: Date;
  time: string;
  duration: number;
  type: AppointmentType;
  status: "PENDING" | "SCHEDULED";
}

/* -----------------------------
   Create Appointment
------------------------------- */
export async function createAppointment({
  patient_id,
  doctor_id,
  appointment_date,
  time,
  duration,
  type,
  status,
}: CreateAppointmentProps) {
  try {
    // Generate video link if type is VIDEO
    let video_link: string | null = null;
    if (type === "VIDEO") {
      video_link = `https://your-video-platform.com/room/${nanoid(10)}`;
    }

    const appointment = await db.appointment.create({
      data: {
        patient_id,
        doctor_id,
        appointment_date,
        time,
        duration,
        type,
        status,
        video_link,
      },
      include: {
        patient: {
          select: { id: true, first_name: true, last_name: true, email: true, img: true },
        },
        doctor: {
          select: { id: true, name: true, email: true, img: true, specialization: true },
        },
      },
    });

    // TODO: send email notifications to patient & doctor
    // sendAppointmentEmail(appointment.patient.email, appointment, "patient");
    // sendAppointmentEmail(appointment.doctor.email, appointment, "doctor");

    return { success: true, data: appointment };
  } catch (err: any) {
    console.error(err);
    return { success: false, message: err.message || "Failed to create appointment" };
  }
}

/* -----------------------------
   Fetch Appointment by ID
------------------------------- */
export async function getAppointmentById(id: number) {
  try {
    if (!id) return { success: false, message: "Appointment id missing", status: 404 };

    const data = await db.appointment.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, first_name: true, last_name: true, email: true, img: true } },
        doctor: { select: { id: true, name: true, specialization: true, email: true, img: true } },
      },
    });

    if (!data) return { success: false, message: "Appointment not found", status: 404 };

    return { success: true, data, status: 200 };
  } catch (err) {
    console.log(err);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}

/* -----------------------------
   Build Query Helper
------------------------------- */
const buildQuery = (id?: string, search?: string): Prisma.AppointmentWhereInput | undefined => {
  const searchConditions: Prisma.AppointmentWhereInput | undefined = search
    ? {
        OR: [
          { patient: { is: { first_name: { contains: search, mode: "insensitive" } } } },
          { patient: { is: { last_name: { contains: search, mode: "insensitive" } } } },
          { doctor: { is: { name: { contains: search, mode: "insensitive" } } } },
        ],
      }
    : undefined;

  const idConditions: Prisma.AppointmentWhereInput | undefined = id
    ? { OR: [{ patient_id: id }, { doctor_id: id }] }
    : undefined;

  if (searchConditions && idConditions) return { AND: [searchConditions, idConditions] };
  return searchConditions ?? idConditions;
};

/* -----------------------------
   Fetch Appointments (Patient/Doctor)
------------------------------- */
interface AllAppointmentsProps {
  page: number | string;
  limit?: number | string;
  search?: string;
  id?: string;
}

export async function getPatientAppointments({ page, limit, search, id }: AllAppointmentsProps) {
  try {
    const PAGE_NUMBER = Number(page) <= 0 ? 1 : Number(page);
    const LIMIT = Number(limit) || 10;
    const SKIP = (PAGE_NUMBER - 1) * LIMIT;

    const [data, totalRecord] = await Promise.all([
      db.appointment.findMany({
        where: buildQuery(id, search),
        skip: SKIP,
        take: LIMIT,
        select: {
          id: true,
          patient_id: true,
          doctor_id: true,
          type: true,
          appointment_date: true,
          time: true,
          duration: true,
          status: true,
          video_link: true, // <-- include video link
          patient: {
            select: { id: true, first_name: true, last_name: true, img: true, email: true, phone: true },
          },
          doctor: {
            select: { id: true, name: true, specialization: true, img: true, email: true },
          },
        },
        orderBy: { appointment_date: "desc" },
      }),
      db.appointment.count({ where: buildQuery(id, search) }),
    ]);

    if (!data) return { success: false, message: "No appointments found", status: 200, data: null };

    const totalPages = Math.ceil(totalRecord / LIMIT);
    return { success: true, data, totalPages, currentPage: PAGE_NUMBER, totalRecord, status: 200 };
  } catch (err) {
    console.log(err);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}

/* -----------------------------
   Fetch Appointment w/ Medical Records
------------------------------- */
export async function getAppointmentWithMedicalRecordsById(id: number) {
  try {
    if (!id) return { success: false, message: "Appointment id missing", status: 404 };

    const data = await db.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
        bills: true,
        medical: { include: { diagnosis: true, lab_test: true, vital_signs: true } },
      },
    });

    if (!data) return { success: false, message: "Appointment not found", status: 200 };
    return { success: true, data, status: 200 };
  } catch (err) {
    console.log(err);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}
