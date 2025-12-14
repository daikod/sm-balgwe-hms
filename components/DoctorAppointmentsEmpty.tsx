"use client";

import { Video } from "@stream-io/video-react-sdk";

export default function DoctorAppointmentsEmpty() {
  return (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <Video
        className="w-16 h-16 text-gray-400 mx-auto mb-4"
        trackType="videoTrack"
        participant={undefined as any}
      />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No Upcoming Appointments
      </h3>
      <p className="text-gray-600">
        You don't have any scheduled consultations at the moment.
      </p>
    </div>
  );
}
