import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import db from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { appointmentId } = await req.json()

    // Update appointment status to IN_PROGRESS
    const appointment = await db.appointment.update({
      where: { id: appointmentId },
      data: { 
        status: 'IN_PROGRESS',
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ appointment })
  } catch (error) {
    console.error('Error starting consultation:', error)
    return NextResponse.json(
      { error: 'Failed to start consultation' },
      { status: 500 }
    )
  }
}
