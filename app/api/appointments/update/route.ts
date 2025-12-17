import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import db from '@/lib/db'
import { AppointmentStatus } from '@prisma/client'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { appointmentId, status } = await req.json()

    if (!Object.values(AppointmentStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid appointment status' },
        { status: 400 }
      )
    }

    const appointment = await db.appointment.update({
      where: { id: appointmentId },
      data: {
        status,
      },
    })

    return NextResponse.json({ appointment })
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    )
  }
}
