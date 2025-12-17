import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import db from '@/lib/db'
import AppointmentCard from '@/components/AppointmentCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Appointment } from '@/types/appointment'

export default async function AdminAppointmentsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  // Verify admin role
  const staff = await db.staff.findUnique({
    where: { id: userId }
  })

  if (!staff || staff.role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  // Fetch all appointments
  const scheduledAppointments = await db.appointment.findMany({
    where: { status: 'SCHEDULED' },
    include: { patient: true, doctor: true },
    orderBy: { appointment_date: 'asc' }
  })

  const inProgressAppointments = await db.appointment.findMany({
    where: { status: 'IN_PROGRESS' },
    include: { patient: true, doctor: true },
    orderBy: { appointment_date: 'asc' }
  })

  const completedAppointments = await db.appointment.findMany({
    where: { status: 'COMPLETED' },
    include: { patient: true, doctor: true },
    orderBy: { appointment_date: 'desc' },
    take: 20
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointment Management</h1>
        <p className="text-gray-600">Monitor and manage all telehealth consultations</p>
      </div>

      <Tabs defaultValue="scheduled" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="scheduled">
            Scheduled ({scheduledAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            In Progress ({inProgressAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scheduled">
          {scheduledAppointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600">No scheduled appointments</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scheduledAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  userRole="ADMIN"
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="in-progress">
          {inProgressAppointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600">No appointments in progress</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgressAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  userRole="ADMIN"
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedAppointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600">No completed appointments</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedAppointments.map((appointment)=> (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  userRole="ADMIN"
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
