'use client'

import { Video, Calendar, Clock, User } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import type { Appointment } from "@/types/appointment";

interface AppointmentCardProps {
    appointment: Appointment;
    userRole: "PATIENT" | "DOCTOR" | "ADMIN";
  }
  


export default function AppointmentCard({ appointment, userRole }: AppointmentCardProps) {
  const canJoinMeeting = appointment.status === 'SCHEDULED' || appointment.status === 'IN_PROGRESS'
  const isUpcoming = new Date(appointment.appointment_date) >= new Date()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {userRole === 'PATIENT' && appointment.doctor && (
            <>
              {appointment.doctor.img ? (
                <img
                  src={appointment.doctor.img}
                  alt={appointment.doctor.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {appointment.doctor.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">{appointment.doctor.name}</h3>
                <p className="text-sm text-gray-600">{appointment.doctor.specialization}</p>
              </div>
            </>
          )}

          {(userRole === 'DOCTOR' || userRole === 'ADMIN') && appointment.patient && (
            <>
              {appointment.patient.img ? (
                <img
                  src={appointment.patient.img}
                  alt={`${appointment.patient.first_name} ${appointment.patient.last_name}`}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {appointment.patient.first_name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">
                  {appointment.patient.first_name} {appointment.patient.last_name}
                </h3>
                <p className="text-sm text-gray-600">Patient</p>
              </div>
            </>
          )}
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
          {appointment.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{format(new Date(appointment.appointment_date), 'EEEE, MMMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{appointment.time} ({appointment.duration} mins)</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span>{appointment.type}</span>
        </div>
      </div>

      {canJoinMeeting && isUpcoming && (
        <Link
          href={`/meeting/${appointment.roomID}`}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Video className="w-5 h-5" />
          Join Video Consultation
        </Link>
      )}

      {!isUpcoming && appointment.status === 'COMPLETED' && (
        <button
          disabled
          className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-500 py-2.5 rounded-lg cursor-not-allowed font-medium"
        >
          Consultation Completed
        </button>
      )}

      {appointment.status === 'CANCELLED' && (
        <button
          disabled
          className="w-full flex items-center justify-center gap-2 bg-red-100 text-red-600 py-2.5 rounded-lg cursor-not-allowed font-medium"
        >
          Consultation Cancelled
        </button>
      )}
    </div>
  )
}
