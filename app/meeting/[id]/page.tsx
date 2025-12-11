
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import db from '@/lib/db' // Your Prisma client
import StreamVideoCall from '@/components/StreamVideoCall'

const MeetingPage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { userId } = await auth()
  const { id: meetingId } = await params

  if (!userId) {
    redirect('/sign-in')
  }

  // Fetch appointment/meeting details from database
  const appointment = await db.appointment.findFirst({
    where: { roomID: meetingId },
    include: {
      patient: true,
      doctor: true,
    },
  })

  if (!appointment) {
    redirect('/dashboard')
  }

  // Check if user is authorized (either patient or doctor)
  const isAuthorized = 
    appointment.patient_id === userId || 
    appointment.doctor_id=== userId

  if (!isAuthorized) {
    redirect('/unauthorized')
  }

  const userRole = appointment.patient_id === userId ? 'patient' : 'doctor'

  return (
    <div className="h-screen">
      <StreamVideoCall
        meetingId={meetingId}
        userId={userId}
        userRole={userRole}
        appointmentData={appointment}
      />
    </div>
  )
}

export default MeetingPage