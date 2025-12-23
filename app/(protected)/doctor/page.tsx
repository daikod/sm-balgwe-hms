// app/(protected)/doctor/page.tsx
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import db from '@/lib/db';
import { DoctorDashboardClient } from './DoctorDashboardClient';
import { AppointmentStatus } from '@/generated/prisma';

export default async function DoctorDashboardPage() {
  const user = await currentUser();
  if (!user?.id) redirect('/sign-in');

  // Fetch last 5 appointments for this doctor
  const appointments = await db.appointment.findMany({
    where: { doctor_id: user.id }, // matches your schema
    include: { patient: true },
    orderBy: { appointment_date: 'desc' },
    take: 5,
  });

  // Compute appointment counts
  const appointmentCounts: Record<AppointmentStatus, number> = {
    PENDING: 0,
    SCHEDULED: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  };
  appointments.forEach((a) => appointmentCounts[a.status]++);

  const totalAppointments = appointments.length;

  // Count total patients for this doctor
  const totalPatients = await db.patient.count({ where: { 
      appointments: {
        some: {
          doctor_id: user.id
        }
      }
    }});

  // Fetch available doctors (uses availability_status in your schema)
  const availableDoctors = await db.doctor.findMany({
    where: { availability_status: 'AVAILABLE' },
    select: {
      id: true,
      name: true,
      gender: true,
      specialization: true,
      img: true,
      email: true,
      phone: true,
      department: true,
      availability_status: true,
      colorCode: true,
    },
  });

  // Monthly data for chart
  const monthlyData = await db.appointment.groupBy({
    by: ['appointment_date'],
    where: { doctor_id: user.id },
    _count: { id: true },
    orderBy: { appointment_date: 'asc' },
  }).then((res) =>
    res.map((r) => ({
      name: r.appointment_date.toLocaleString('default', { month: 'short' }),
      appointment: r._count.id,
      completed: 0, // optionally compute completed appointments
    }))
  );

  // Normalize last 5 appointments for UI
  const last5Records = appointments.map((a) => ({
    id: String(a.id),
    type: a.type,
    status: a.status,
    appointment_date: a.appointment_date,
    roomID: a.roomID ?? undefined,
    time: a.time ?? undefined,
    duration: a.duration ?? undefined,
    patient: a.patient
      ? {
          first_name: a.patient.first_name,
          last_name: a.patient.last_name,
          img: a.patient.img ?? null,
        }
      : undefined,
  }));

  const plainUser = {
    id: user.id,
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    email: user.primaryEmailAddressId ?? '',
    imageUrl: user.imageUrl ?? '',
  };

  return (
    <DoctorDashboardClient
      user={plainUser}
      appointmentCounts={appointmentCounts}
      totalAppointments={totalAppointments}
      totalPatients={totalPatients}
      availableDoctors={availableDoctors}
      monthlyData={monthlyData}
      last5Records={last5Records}
    />
  );
}
