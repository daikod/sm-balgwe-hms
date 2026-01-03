// app/(protected)/doctor/page.tsx
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import db from '@/lib/db';
import { DoctorDashboardClient } from './DoctorDashboardClient';
import { AppointmentStatus, Role } from '@prisma/client';
import { getDoctorInbox, getUnreadCount } from '@/lib/notifications';

export default async function DoctorDashboardPage() {
  const user = await currentUser();
  if (!user?.id) redirect('/sign-in');

  // Fetch last 5 appointments for this doctor
  const appointments = await db.appointment.findMany({
    where: { doctorId: user.id },
    orderBy: { appointment_date: 'desc' },
    take: 5,
    select: {
      id: true,
      type: true,
      status: true,
      appointment_date: true,
      roomID: true,
      time: true,
      duration: true,
      patientId: true, // match schema
    },
  });

  // Compute appointment counts
  const appointmentCounts: Record<AppointmentStatus, number> = {
    PENDING: 0,
    SCHEDULED: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
    CANCELLED: 0,
    READY_FOR_ADMISSION: 0,
    MISSED: 0,
  };
  appointments.forEach((a) => {
    if (appointmentCounts[a.status] !== undefined) {
      appointmentCounts[a.status]++;
    }
  });

  const totalAppointments = appointments.length;

  // Count total patients for this doctor
  const totalPatients = await db.patient.count({
    where: {
      appointments: {
        some: {
          doctorId: user.id,
        },
      },
    },
  });

  // Count active admissions
  const totalAdmissions = await db.admission.count({
    where: { status: 'ACTIVE' },
  });

  // Fetch available doctors
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
  const monthlyDataRaw = await db.appointment.groupBy({
    by: ['appointment_date'],
    where: { doctorId: user.id },
    _count: { id: true },
    orderBy: { appointment_date: 'asc' },
  });

  const monthlyData = monthlyDataRaw.map((r) => ({
    name: r.appointment_date.toLocaleString('default', { month: 'short' }),
    appointment: r._count?.id ?? 0,
    completed: 0,
  }));

  // Normalize last 5 appointments for UI
  const last5Records = appointments.map((a) => ({
    id: String(a.id),
    type: a.type,
    status: a.status,
    appointment_date: a.appointment_date,
    roomID: a.roomID ?? undefined,
    time: a.time ?? undefined,
    duration: a.duration ?? undefined,
    patient: a.patientId ? { id: a.patientId } : undefined,
  }));

  // Notifications
  const notifications = await getDoctorInbox(user.id);
  const unreadCount = await getUnreadCount(user.id, Role.DOCTOR);

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
      totalAdmissions={totalAdmissions}
      availableDoctors={availableDoctors}
      monthlyData={monthlyData}
      last5Records={last5Records}
      notifications={notifications}
      unreadCount={unreadCount}
    />
  );
}
