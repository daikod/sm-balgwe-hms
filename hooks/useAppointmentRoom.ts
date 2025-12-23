'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import WaitingRoomCountdown from '@/components/WaitingRoomCountdown'; // Assuming this is imported

type WaitingRoomCountdownType = typeof WaitingRoomCountdown;  // Correctly using `typeof`

// Moved this type outside of the component to make it accessible
interface UseAppointmentRoomProps {
  appointmentId: string
  roomID?: string | null
  appointmentDate?: string | Date | null
}

export function useAppointmentRoom({
  appointmentId,
  roomID,
  appointmentDate,
}: UseAppointmentRoomProps) {
  const router = useRouter()

  const [countdown, setCountdown] = useState<number | null>(null)
  const [roomReady, setRoomReady] = useState<boolean>(!!roomID)

  /**
   * Waiting room countdown
   */
  useEffect(() => {
    if (!appointmentDate || roomReady) return

    const startTime = new Date(appointmentDate).getTime()

    const interval = setInterval(() => {
      const now = Date.now()
      const diff = Math.max(0, Math.floor((startTime - now) / 1000))

      setCountdown(diff)

      if (diff === 0) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [appointmentDate, roomReady])

  /**
   * Poll for room availability (patient auto-refresh)
   */
  useEffect(() => {
    if (roomReady) return

    const interval = setInterval(async () => {
      const res = await fetch(`/api/appointments/${appointmentId}`)
      const data = await res.json()

      if (data?.roomID) {
        setRoomReady(true)
        router.refresh()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [appointmentId, roomReady, router])

  return {
    roomReady,
    countdown, // seconds remaining
  }
}
