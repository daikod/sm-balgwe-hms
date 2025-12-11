import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import db from '@/lib/db'
import AppointmentCard from '@/components/AppointmentCard'
import { Video } from '@stream-io/video-react-sdk'

export default async function DoctorAppointmentsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  // Fetch doctor's appointments
  const appointments = await db.appointment.findMany({
    where: {
      doctor_id: userId,
      status: {
        in: ['SCHEDULED', 'IN_PROGRESS']
      }
    },
    include: {
      patient: true,
      doctor: true,
    },
    orderBy: {
      appointment_date: 'asc'
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
        <p className="text-gray-600">Manage your upcoming consultations</p>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" trackType={'videoTrack'} participant={undefined as any} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Upcoming Appointments</h3>
          <p className="text-gray-600">You don't have any scheduled consultations at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((appointment) => (
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
