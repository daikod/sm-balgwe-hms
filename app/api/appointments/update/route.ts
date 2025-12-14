import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import db from '@/lib/db' // Your Prisma client

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { appointmentId, status } = await req.json()

    const appointment = await db.appointment.update({
      where: { id: appointmentId },
      data: { 
        status,
        updated_at: new Date(),
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