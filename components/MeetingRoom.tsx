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
import { LayoutList, Users, MessageSquare, X } from 'lucide-react'

type CallLayoutType = 'grid' | 'speaker'

interface MeetingRoomProps {
  meetingId: string
  userRole: 'patient' | 'doctor'
  appointmentData: any
}

const MeetingRoom = ({ meetingId, userRole, appointmentData }: MeetingRoomProps) => {
  const router = useRouter()
  const [layout, setLayout] = useState<CallLayoutType>('speaker')
  const [showParticipants, setShowParticipants] = useState(false)
  const { useCallCallingState } = useCallStateHooks()
  const callingState = useCallCallingState()

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Joining consultation...</p>
        </div>
      </div>
    )
  }

  const handleLeaveCall = async () => {
    // Update appointment status in database
    await fetch('/api/appointments/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appointmentId: appointmentData.id,
        status: 'COMPLETED',
      }),
    })

    router.push('/dashboard')
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-semibold text-lg">
              {userRole === 'doctor' ? 'Patient Consultation' : 'Doctor Consultation'}
            </h1>
            <p className="text-gray-400 text-sm">
              {userRole === 'doctor' 
                ? `Patient: ${appointmentData.patient.name}`
                : `Doctor: ${appointmentData.doctor.name}`
              }
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLayout(layout === 'grid' ? 'speaker' : 'grid')}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              aria-label={layout === 'grid' ? 'Switch to speaker view' : 'Switch to grid view'}
              title={layout === 'grid' ? 'Switch to speaker view' : 'Switch to grid view'}
            >
              <LayoutList className="w-5 h-5 text-white" />
            </button>
            
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              aria-label={showParticipants ? 'Hide participants' : 'Show participants'}
              title={showParticipants ? 'Hide participants' : 'Show participants'}
            >
              <Users className="w-5 h-5 text-white" />
            </button>

            <CallStatsButton />
          </div>
        </div>
      </div>

      {/* Video Layout */}
      <div className="flex-1 relative">
        {layout === 'speaker' ? (
          <SpeakerLayout participantsBarPosition="bottom" />
        ) : (
          <PaginatedGridLayout />
        )}

        {/* Participants Sidebar */}
        {showParticipants && (
          <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-xl p-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Participants</h3>
              <button 
                onClick={() => setShowParticipants(false)}
                aria-label="Close participants panel"
                title="Close participants panel"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <CallParticipantsList onClose={() => setShowParticipants(false)} />
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
        <CallControls onLeave={handleLeaveCall} />
      </div>
    </div>
  )
}

export default MeetingRoom