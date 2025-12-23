'use client';

import { useRouter } from 'next/navigation';

interface AppointmentCardProps {
  appointment: {
    id: string;
    type: 'VIDEO' | 'PHYSICAL';
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'PENDING' | 'CANCELLED';
    roomID?: string;
    appointment_date: string | Date;
    patient?: {
      first_name: string;
      last_name: string;
      img?: string | null;
    };
  };
  userRole: 'DOCTOR' | 'PATIENT';
  showVideoButton?: boolean;
}

export default function AppointmentCard({
  appointment,
  userRole,
  showVideoButton = true,
}: AppointmentCardProps) {
  const router = useRouter();

  const appointmentType = appointment.type;
  const appointmentStatus = appointment.status;
  const roomID = appointment.roomID || '';

  const startConsultation = async () => {
    const res = await fetch('/api/appointments/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId: appointment.id }),
    });

    if (!res.ok) return;
    const data = await res.json();

    if (data.roomID) {
      router.push(`/meeting/${data.roomID}`);
    }
  };

  const patientName = appointment.patient
    ? `${appointment.patient.first_name} ${appointment.patient.last_name}`
    : 'Patient';

  const formattedDate = new Date(
    appointment.appointment_date
  ).toLocaleString();

  const canDoctorStartVideo =
    showVideoButton &&
    userRole === 'DOCTOR' &&
    appointmentType === 'VIDEO' &&
    appointmentStatus === 'SCHEDULED';

  const canDoctorRejoin =
    showVideoButton &&
    userRole === 'DOCTOR' &&
    appointmentStatus === 'IN_PROGRESS' &&
    roomID;

  const canPatientJoin =
    showVideoButton &&
    userRole === 'PATIENT' &&
    roomID;

  return (
    <div className="rounded-lg border p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{patientName}</h3>
        {appointment.patient?.img && (
          <img
            src={appointment.patient.img}
            className="w-8 h-8 rounded-full"
            alt={patientName}
          />
        )}
      </div>

      <p className="text-sm text-gray-600 mt-2">{formattedDate}</p>

      {canDoctorStartVideo && (
        <button
          type="button"
          onClick={startConsultation}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded"
        >
          Start Video Consultation
        </button>
      )}

      {canDoctorRejoin && (
        <button
          type="button"
          onClick={() => router.push(`/meeting/${roomID}`)}
          className="mt-4 w-full bg-green-600 text-white py-2 rounded"
        >
          Rejoin Consultation
        </button>
      )}

      {canPatientJoin && (
        <button
          type="button"
          onClick={() => router.push(`/meeting/${roomID}`)}
          className="mt-4 w-full bg-green-600 text-white py-2 rounded"
        >
          Join Video Consultation
        </button>
      )}

      {userRole === 'PATIENT' &&
        appointmentType === 'VIDEO' &&
        !roomID && (
          <p className="mt-4 text-sm text-gray-500">
            Waiting for doctor to start consultation
          </p>
        )}
    </div>
  );
}
