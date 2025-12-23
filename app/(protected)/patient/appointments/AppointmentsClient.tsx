'use client'

import AppointmentCard from '@/components/AppointmentCard'
import EmptyAppointmentsClient from './EmptyAppointmentsClient'
import type { Appointment } from '@/types/appointment'
import { AppointmentType } from '@prisma/client'

interface Props {
  appointments: Appointment[]
  userRole: 'PATIENT'
}

export default function AppointmentsClient({ appointments, userRole }: Props) {
  // ✅ Normalize appointments: id as string, type as union
  const normalizedAppointments = appointments
  .filter((a) => a.status !== 'PENDING')
  .map((a) => ({
    ...a,
    id: String(a.id),
    type: a.type as 'VIDEO' | 'PHYSICAL',
    patient: a.patient
      ? {
          first_name: a.patient.first_name,
          last_name: a.patient.last_name,
          img: a.patient.img ?? undefined,
        }
      : undefined,
    doctor: a.doctor
      ? {
          name: a.doctor.name,
          specialization: a.doctor.specialization,
          img: a.doctor.img ?? undefined,
        }
      : undefined,
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Appointments
        </h1>
        <p className="text-gray-600">
          View and join your scheduled consultations
        </p>
      </div>

      {normalizedAppointments.length === 0 ? (
        <EmptyAppointmentsClient />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {normalizedAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              userRole={userRole}
            />
          ))}
        </div>
      )}
    </div>
  )
}
