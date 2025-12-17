'use client'

import { useState } from 'react'
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from '@stream-io/video-react-sdk'
import { useRouter } from 'next/navigation'
import { LayoutList, Users, X } from 'lucide-react'

interface MeetingRoomProps {
  meetingId: string
  userRole: 'patient' | 'doctor'
  appointmentData: any
}

const MeetingRoom = ({
  meetingId,
  userRole,
  appointmentData,
}: MeetingRoomProps) => {
  const router = useRouter()
  const [layout, setLayout] = useState<'grid' | 'speaker'>('speaker')
  const [showParticipants, setShowParticipants] = useState(false)

  const { useCallCallingState } = useCallStateHooks()
  const callingState = useCallCallingState()

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        Joining consultation...
      </div>
    )
  }

  const handleLeave = async () => {
    try {
      await fetch('/api/appointments/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: appointmentData.id,
          status: 'COMPLETED',
        }),
      })
    } catch (e) {
      console.error(e)
    } finally {
      router.push('/dashboard')
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-white font-semibold">
          {userRole === 'doctor'
            ? 'Patient Consultation'
            : 'Doctor Consultation'}
        </h1>

        <div className="flex gap-3">
          {/* Layout toggle */}
          <button
            type="button"
            onClick={() => setLayout(layout === 'grid' ? 'speaker' : 'grid')}
            className="p-2 bg-gray-700 rounded"
            aria-label={
              layout === 'grid'
                ? 'Switch to speaker layout'
                : 'Switch to grid layout'
            }
            title={
              layout === 'grid'
                ? 'Switch to speaker layout'
                : 'Switch to grid layout'
            }
          >
            <LayoutList className="text-white" />
          </button>

          {/* Participants toggle */}
          <button
            type="button"
            onClick={() => setShowParticipants(!showParticipants)}
            className="p-2 bg-gray-700 rounded"
            aria-label={
              showParticipants
                ? 'Hide participants'
                : 'Show participants'
            }
            title={
              showParticipants
                ? 'Hide participants'
                : 'Show participants'
            }
          >
            <Users className="text-white" />
          </button>

          <CallStatsButton />
        </div>
      </div>

      {/* Video */}
      <div className="flex-1 relative">
        {layout === 'speaker' ? (
          <SpeakerLayout participantsBarPosition="bottom" />
        ) : (
          <PaginatedGridLayout />
        )}

        {showParticipants && (
          <div className="absolute top-4 right-4 w-80 bg-white rounded-lg p-4 shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Participants</h3>
              <button
                type="button"
                onClick={() => setShowParticipants(false)}
                aria-label="Close participants panel"
                title="Close participants panel"
              >
                <X />
              </button>
            </div>

            {/* ✅ REQUIRED onClose PROP */}
            <CallParticipantsList
              onClose={() => setShowParticipants(false)}
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-6 py-4">
        <CallControls onLeave={handleLeave} />
      </div>
    </div>
  )
}

export default MeetingRoom
