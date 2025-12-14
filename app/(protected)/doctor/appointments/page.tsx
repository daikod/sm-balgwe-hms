import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import db from '@/lib/db'
import AppointmentCard from '@/components/AppointmentCard'
import DoctorAppointmentsEmpty from '@/components/DoctorAppointmentsEmpty'

export default async function DoctorAppointmentsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const appointments = await db.appointment.findMany({
    where: {
      doctor_id: userId,
      status: {
        in: ['SCHEDULED', 'IN_PROGRESS'],
      },
    },
    include: {
      patient: true,
      doctor: true,
    },
    orderBy: {
      appointment_date: 'asc',
    },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Appointments
        </h1>
        <p className="text-gray-600">
          Manage your upcoming consultations
        </p>
      </div>

      {appointments.length === 0 ? (
        <DoctorAppointmentsEmpty />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((appointment: any) => (
            <AppointmentCard
              key={appointment.id}
              appointment={{
                ...appointment,
                patient: {
                  ...appointment.patient,
                  img: appointment.patient.img ?? undefined,
                },
                doctor: {
                  ...appointment.doctor,
                  img: appointment.doctor.img ?? undefined,
                },
              }}
              userRole="DOCTOR"
            />
          ))}
        </div>
      )}
    </div>
  )
}
