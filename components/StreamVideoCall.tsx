
'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { StreamVideo, StreamVideoClient, StreamCall } from '@stream-io/video-react-sdk'
// @ts-ignore: CSS module without type declarations
import '@stream-io/video-react-sdk/dist/css/styles.css'
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
  appointmentData 
}: StreamVideoCallProps) => {
  const { user } = useUser()
  const [client, setClient] = useState<StreamVideoClient | null>(null)
  const [call, setCall] = useState<any>(null)

  useEffect(() => {
    if (!user) return

    const initStream = async () => {
      // Fetch Stream token from your API
      const response = await fetch('/api/stream/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      const { token } = await response.json()

      // Initialize Stream client
      const streamClient = new StreamVideoClient({
        apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
        user: {
          id: userId,
          name: user.fullName || user.username || 'User',
          image: user.imageUrl,
        },
        token,
      })

      setClient(streamClient)

      // Create or join call
      const callInstance = streamClient.call('default', meetingId)
      await callInstance.join({ create: true })
      setCall(callInstance)
    }

    initStream()

    return () => {
      call?.leave()
      client?.disconnectUser()
    }
  }, [user, userId, meetingId])

  if (!client || !call) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Connecting to consultation...</p>
        </div>
      </div>
    )
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
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