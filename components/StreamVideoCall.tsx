'use client';

import { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { StreamVideo, StreamVideoClient, StreamCall } from '@stream-io/video-react-sdk';
import MeetingRoom from './MeetingRoom';

interface StreamVideoCallProps {
  meetingId: string;
  userId: string;
  userRole: 'patient' | 'doctor';
  appointmentData: any;
}

const StreamVideoCall = ({
  meetingId,
  userId,
  userRole,
  appointmentData,
}: StreamVideoCallProps) => {
  const { user } = useUser();
  const clientRef = useRef<StreamVideoClient | null>(null);
  const callRef = useRef<any>(null); // TS-safe, refs StreamCall instance

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctorJoined, setDoctorJoined] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [callStartedAt, setCallStartedAt] = useState<Date | null>(null);

  const callTimeoutLimit = 60 * 60 * 1000; // 1 hour

  useEffect(() => {
    if (!user) return;

    const init = async () => {
      try {
        const res = await fetch('/api/stream/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });

        const { token } = await res.json();
        if (!token) throw new Error('Missing Stream token');

        const client = new StreamVideoClient({
          apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
          user: {
            id: userId,
            name: user.fullName || user.username || 'User',
            image: user.imageUrl || '',
          },
          token,
        });

        const call = client.call('default', meetingId);

        // Doctor creates the room; patient just joins
        if (userRole === 'doctor') {
          await call.join({ create: true });
          setDoctorJoined(true);
        } else {
          await call.join();
        }

        clientRef.current = client;
        callRef.current = call;
        setLoading(false);
        setCallStartedAt(new Date());
      } catch (e) {
        console.error(e);
        setError('Failed to connect to video consultation');
        setLoading(false);
      }
    };

    init();

    // Auto-end call if over timeout
    const checkCallTimeout = () => {
      if (callStartedAt && new Date().getTime() - callStartedAt.getTime() > callTimeoutLimit) {
        callRef.current?.leave().catch(() => {});
        clientRef.current?.disconnectUser().catch(() => {});
        setError('Call has been automatically ended due to inactivity.');
      }
    };

    const interval = setInterval(checkCallTimeout, 60000);

    return () => {
      clearInterval(interval);
      callRef.current?.leave().catch(() => {});
      clientRef.current?.disconnectUser().catch(() => {});
    };
  }, [user, userId, meetingId, userRole, callStartedAt]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        Connecting to consultation…
      </div>
    );

  if (error)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        {error}
      </div>
    );

  return (
    <>
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 bg-green-600 text-white py-2 text-center">
          <strong>Doctor has joined the call.</strong>
        </div>
      )}

      <StreamVideo client={clientRef.current!}>
        <StreamCall call={callRef.current!}>
          <MeetingRoom
            meetingId={meetingId}
            userRole={userRole}
            appointmentData={appointmentData}
            onCallStart={() => setShowBanner(true)}
          />
        </StreamCall>
      </StreamVideo>
    </>
  );
};

export default StreamVideoCall;
