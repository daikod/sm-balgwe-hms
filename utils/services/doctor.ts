import { AppointmentStatus, Prisma } from "@prisma/client";
import db from "@/lib/db";

/**
 * Prisma payload WITH relations
 */
type AppointmentWithRelations =
  Prisma.AppointmentGetPayload<{
    include: {
      patient: true;
      doctor: true;
    };
  }>;

/**
 * Doctor with working days
 */
export type DoctorWithWorkingDays =
  Prisma.DoctorGetPayload<{
    include: { working_days: true };
  }>;

/**
 * Get all doctors
 */
export const getDoctors = async () => {
  const data: DoctorWithWorkingDays[] = await db.doctor.findMany({
    orderBy: { name: "asc" },
    include: { working_days: true },
  });

  return { data };
};

/**
 * Get doctor by ID
 */
export const getDoctorById = async (id: string) => {
  const data = await db.doctor.findUnique({
    where: { id },
    include: {
      working_days: true,
      appointments: true,
    },
  });

  if (!data) return { data: null, totalAppointment: 0 };

  return {
    data,
    totalAppointment: data.appointments.length,
  };
};

/**
 * Paginated doctors (admin)
 */
export const getAllDoctors = async ({
  page,
  search,
}: {
  page: number;
  search?: string;
}) => {
  const PAGE_SIZE = 10;

  const where: Prisma.DoctorWhereInput = search
    ? {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }
    : {};

  const [data, totalRecords] = await Promise.all([
    db.doctor.findMany({
      where,
      include: { working_days: true },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { created_at: "desc" },
    }),
    db.doctor.count({ where }),
  ]);

  return {
    data,
    totalRecords,
    totalPages: Math.ceil(totalRecords / PAGE_SIZE),
    currentPage: page,
  };
};

/**
 * Doctor appointments (used by DoctorAppointmentsPage)
 * ⚠️ RAW Prisma objects on purpose – mapping happens at page level
 */
export const getDoctorAppointments = async (doctorId: string) => {
  return db.appointment.findMany({
    where: { doctorId: doctorId },
    include: {
      patient: {
        select: {
          first_name: true,
          last_name: true,
          img: true,
        },
      },
      doctor: true,
    },
    orderBy: { appointment_date: "desc" },
    take: 10,
  });
};

/**
 * Doctor ratings
 */
export const getRatingById = async (doctorId: string) => {
  const ratings = await db.rating.findMany({
    where: { doctorId },
    orderBy: { created_at: "desc" },
  });

  const totalRatings = ratings.length;

  const averageRating =
    totalRatings === 0
      ? 0
      : ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

  return {
    ratings,
    totalRatings,
    averageRating,
  };
};

/**
 * Doctor dashboard statistics
 * Used by DoctorDashboard + charts + cards
 */
export async function getDoctorDashboardStats(doctorId: string) {
  const appointments: AppointmentWithRelations[] =
    await db.appointment.findMany({
      where: { doctorId: doctorId },
      include: { patient: true, doctor: true },
      orderBy: { appointment_date: "desc" },
    });

  // ✅ Local, per-call counters (prevents cross-request pollution)
  const appointmentCounts: Record<AppointmentStatus, number> = {
    PENDING: 0,
    SCHEDULED: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
    CANCELLED: 0,
    READY_FOR_ADMISSION: 0,
    MISSED: 0
  };

  appointments.forEach((a) => {
    appointmentCounts[a.status]++;
  });

  /**
   * Last 5 records – SAFE for dashboard cards
   * (no Prisma-only fields relied on by UI)
   */
  const last5Records = appointments.slice(0, 5).map((a) => ({
    ...a,
    id: a.id, // keep numeric here – mapping happens in page
    doctor: a.doctor
      ? {
          ...a.doctor,
          gender: a.doctor.gender ?? undefined,
        }
      : undefined,
    patient: a.patient
      ? {
          ...a.patient,
          img: a.patient.img ?? null,
        }
      : undefined,
  }));

  /**
   * Monthly chart data
   */
  const monthMap: Record<string, number> = {};
  appointments.forEach((a) => {
    const month = a.appointment_date.toLocaleString("default", {
      month: "short",
    });
    monthMap[month] = (monthMap[month] || 0) + 1;
  });

  const monthlyData = Object.entries(monthMap).map(([month, count]) => ({
    month,
    count,
  }));

  const totalPatient = new Set(
    appointments.map((a) => a.patientId)
  ).size;

  const availableDoctors = await db.doctor.findMany({
    where: { availability_status: "AVAILABLE" },
  });

  return {
    totalPatient,
    totalNurses: 0,
    totalAppointment: appointments.length,
    availableDoctors,
    monthlyData,
    last5Records,
    appointmentCounts,
  };
}
