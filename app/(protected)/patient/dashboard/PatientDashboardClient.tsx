"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Briefcase, BriefcaseBusiness, BriefcaseMedical } from "lucide-react";
import { AvailableDoctors } from "@/components/available-doctor";
import { AppointmentChart } from "@/components/charts/appointment-chart";
import { StatSummary } from "@/components/charts/stat-summary";
import { StatCard } from "@/components/stat-card";
import { RecentAppointments } from "@/components/tables/recent-appointment";
import { BookAppointmentButton } from "@/components/patient/book-appointment-button";
import { sendVideoCallStartedEmail } from "@/utils/email";

// Define the Vitals interface
export interface Vitals {
  temperature?: number;
  bloodPressure?: string;
  heartRate?: number;
  respiratoryRate?: number;
  [key: string]: any;
}

// PatientDTO type used in client
export interface PatientDTO {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  img: string | null;
  date_of_birth: Date;
  gender: string; // cast to Prisma Gender when needed
  marital_status: string;
  emergency_contact_name: string;
  emergency_contact_number: string;
  relation: string;
  blood_group: string | null;
  allergies: string | null;
  medical_conditions: string | null;
  medical_history: string | null;
  insurance_provider: string | null;
  insurance_number: string | null;
  privacy_consent: boolean;
  service_consent: boolean;
  medical_consent: boolean;
  colorCode: string | null;
  created_at: Date;
  updated_at: Date;
  doctorId: string | null;
  status: string; // cast to Prisma Status when needed
  onboarded: boolean;
  vitals: Vitals;
}

interface PatientDashboardClientProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string;
  };
  patientData: PatientDTO;
  doctors: any[];
  data: any;
  appointmentCounts: any;
  last5Records: any[];
  totalAppointments: number;
  monthlyData: any[];
}

const PatientDashboardClient: React.FC<PatientDashboardClientProps> = ({
  user,
  patientData,
  doctors,
  data,
  appointmentCounts,
  last5Records,
  totalAppointments,
  monthlyData,
}) => {
  const [isDoctorJoined, setIsDoctorJoined] = useState(false);

  /** Normalize patient for booking */
  const normalizedPatientForBooking = {
    ...patientData,
    date_of_birth: new Date(patientData.date_of_birth),
    created_at: new Date(patientData.created_at),
    updated_at: new Date(patientData.updated_at),
    onboarded: patientData.onboarded ?? true,
    doctorId: patientData.doctorId ?? null,
    vitals: patientData.vitals ?? {
      temperature: undefined,
      bloodPressure: undefined,
      heartRate: undefined,
      respiratoryRate: undefined,
    },
    // ✅ Cast gender & status to match Prisma types when passing to BookAppointmentButton
    gender: patientData.gender as unknown as import("@prisma/client").Gender,
    status: patientData.status as unknown as import("@prisma/client").Status,
  };

  /** Track doctor joined status */
  useEffect(() => {
    last5Records.forEach((appt) => {
      if (appt.status === "IN_PROGRESS") setIsDoctorJoined(true);
    });
  }, [last5Records]);

  /** Start consultation email */
  const handleStartConsultation = async (
    appointmentId: string,
    patientEmail: string
  ) => {
    await sendVideoCallStartedEmail({
      to: patientEmail,
      patientName: patientData.first_name,
      doctorName: "Doctor Name",
      roomID: `appointment-${appointmentId}`,
    });
  };

  /** Dashboard Stat Cards */
  const cardData = [
    {
      title: "Appointments",
      value: totalAppointments,
      icon: Briefcase,
      className: "bg-blue-800",
      iconClassName: "bg-blue-950/25 text-blue-600",
      note: "Total appointments",
      link: "/record/appointments",
    },
    {
      title: "Cancelled",
      value: appointmentCounts?.CANCELLED || 0,
      icon: Briefcase,
      className: "bg-orange-700",
      iconClassName: "bg-rose-950/25 text-rose-600",
      note: "Cancelled appointments",
      link: "/record/appointments",
    },
    {
      title: "Pending",
      value:
        (appointmentCounts?.PENDING || 0) +
        (appointmentCounts?.SCHEDULED || 0),
      icon: BriefcaseBusiness,
      className: "bg-yellow-800",
      iconClassName: "bg-yellow-600/25 text-yellow-600",
      note: "Pending appointments",
      link: "/record/appointments",
    },
    {
      title: "Completed",
      value: appointmentCounts?.COMPLETED || 0,
      icon: BriefcaseMedical,
      className: "bg-emerald-800",
      iconClassName: "bg-emerald-600/25 text-emerald-600",
      note: "Completed appointments",
      link: "/record/appointments",
    },
  ];

  useEffect(() => {
    fetch("/api/appointments/check-missed", { method: "POST" });
  }, []);

  return (
    <div className="py-6 px-3 flex flex-col rounded-xl xl:flex-row gap-6">
      {/* LEFT */}
      <div className="w-full xl:w-[69%]">
        <div className="bg-white rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg xl:text-2xl font-semibold text-blue-950">
              Welcome {data.first_name || user.firstName}
            </h1>

            <div className="space-x-0.5 flex items-center">
              <BookAppointmentButton
                patientData={normalizedPatientForBooking}
                doctors={doctors}
              />
              <Button size="sm">{new Date().getFullYear()}</Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/patient/self">View Profile</Link>
              </Button>
            </div>
          </div>

          <div className="w-full flex flex-wrap gap-5">
            {cardData.map((el, idx) => (
              <StatCard key={idx} {...el} />
            ))}
          </div>
        </div>

        <div className="h-125">
          <AppointmentChart data={monthlyData} />
        </div>

        <div className="bg-white rounded-xl p-4 mt-8">
          <RecentAppointments
            data={last5Records}
            userId={user.id}
            isAdmin={false}
            onStartCall={handleStartConsultation}
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-[30%]">
        <div className="w-full h-112.5 mb-8">
          <StatSummary data={appointmentCounts} total={totalAppointments} />
        </div>

        <AvailableDoctors data={doctors} />
      </div>

      {isDoctorJoined && (
        <div className="fixed top-0 left-0 right-0 bg-green-600 text-white p-4 text-center">
          <p>The doctor has joined the video call! Join now.</p>
        </div>
      )}
    </div>
  );
};

export default PatientDashboardClient;
