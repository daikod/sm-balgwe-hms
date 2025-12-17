'use client'

import { useEffect, useRef, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
} from '@stream-io/video-react-sdk'
import MeetingRoom from './MeetingRoom'

interface StreamVideoCallProps {
  meetingId: string
  userId: string
  userRole: 'patient' | 'doctor'
  appointmentData: any
}

const StreamVideoCall = ({
  meetingId,
  userId,
  userRole,
  appointmentData,
}: StreamVideoCallProps) => {
  const { user } = useUser()
  const clientRef = useRef<StreamVideoClient | null>(null)
  const callRef = useRef<any>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const init = async () => {
      try {
        const res = await fetch('/api/stream/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        })

        const { token } = await res.json()
        if (!token) throw new Error('Missing Stream token')

        const client = new StreamVideoClient({
          apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
          user: {
            id: userId,
            name: user.fullName || user.username || 'User',
            image: user.imageUrl || '',
          },
          token,
        })

        const call = client.call('default', `appointment-${meetingId}`)
        await call.join({ create: true })

        clientRef.current = client
        callRef.current = call
        setLoading(false)
      } catch (e) {
        console.error(e)
        setError('Failed to connect to video consultation')
        setLoading(false)
      }
    }

    init()

    return () => {
      callRef.current?.leave().catch(() => {})
      clientRef.current?.disconnectUser().catch(() => {})
    }
  }, [user, userId, meetingId])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        Connecting to consultation...
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        {error}
      </div>
    )
  }

  return (
    <StreamVideo client={clientRef.current!}>
      <StreamCall call={callRef.current!}>
        <MeetingRoom
          meetingId={meetingId}
          userRole={userRole}
          appointmentData={appointmentData}
        />
      </StreamCall>
    </StreamVideo>
  )
}

export default StreamVideoCall
