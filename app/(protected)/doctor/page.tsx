import AppointmentCard from "@/components/AppointmentCard";
import { AvailableDoctors } from "@/components/available-doctor";
import { AppointmentChart } from "@/components/charts/appointment-chart";
import { StatSummary } from "@/components/charts/stat-summary";
import { StatCard } from "@/components/stat-card";
import { RecentAppointments } from "@/components/tables/recent-appointment";
import { Button } from "@/components/ui/button";
import { getDoctorDashboardStats } from "@/utils/services/doctor";
import { currentUser } from "@clerk/nextjs/server";
import {
  BriefcaseBusiness,
  BriefcaseMedical,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import { AppointmentStatus } from "@prisma/client";

/* ✅ ENUM-SAFE DEFAULT */
const EMPTY_APPOINTMENT_COUNTS: Record<AppointmentStatus, number> = {
  PENDING: 0,
  SCHEDULED: 0,
  IN_PROGRESS: 0,
  COMPLETED: 0,
  CANCELLED: 0,
};

const DoctorDashboard = async () => {
  const user = await currentUser();

  if (!user?.id) {
    redirect("/sign-in");
  }

  const stats = await getDoctorDashboardStats(user.id);

  const totalPatient = stats.totalPatient ?? 0;
  const totalNurses = stats.totalNurses ?? 0;
  const totalAppointment = stats.totalAppointment ?? 0;
  const availableDoctors = stats.availableDoctors ?? [];
  const monthlyData = stats.monthlyData ?? [];

  // ✅ Normalize last5Records doctor.gender
  const last5Records = (stats.last5Records ?? []).map((a) => ({
    ...a,
    doctor: a.doctor
      ? {
          ...a.doctor,
          gender: a.doctor.gender ?? undefined,
        }
      : undefined,
  }));

  /* ✅ NORMALIZED — FULL ENUM GUARANTEED */
  const appointmentCounts: Record<AppointmentStatus, number> = {
    ...EMPTY_APPOINTMENT_COUNTS,
    ...(stats.appointmentCounts ?? {}),
  };

  const cardData = [
    {
      title: "Patients",
      value: totalPatient,
      icon: Users,
      className: "bg-blue-600/15",
      iconClassName: "bg-blue-600/25 text-blue-600",
      note: "Total patients",
      link: "/record/patients",
    },
    {
      title: "Nurses",
      value: totalNurses,
      icon: User,
      className: "bg-rose-600/15",
      iconClassName: "bg-rose-600/25 text-rose-600",
      note: "Total nurses",
      link: "",
    },
    {
      title: "Appointments",
      value: totalAppointment,
      icon: BriefcaseBusiness,
      className: "bg-yellow-600/15",
      iconClassName: "bg-yellow-600/25 text-yellow-600",
      note: "Total appointments",
      link: "/record/appointments",
    },
    {
      title: "Consultation",
      value: appointmentCounts.COMPLETED,
      icon: BriefcaseMedical,
      className: "bg-emerald-600/15",
      iconClassName: "bg-emerald-600/25 text-emerald-600",
      note: "Total consultation",
      link: "/record/appointments",
    },
  ];

  return (
    <div className="rounded-xl py-6 px-3 flex flex-col xl:flex-row gap-6">
      {/* LEFT */}
      <div className="w-full xl:w-[69%]">
        <div className="bg-gray-200 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg xl:text-2xl font-bold">
              Welcome, Dr. {user.firstName}
            </h1>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/record/doctors/${user.id}`}>View profile</Link>
            </Button>
          </div>

          <div className="w-full flex flex-wrap gap-2">
            {cardData.map((el, index) => (
              <StatCard key={index} {...el} />
            ))}
          </div>
        </div>

        <div className="h-125">
          <AppointmentChart
            data={[
              { name: "Jan", appointment: 12, completed: 8 },
              { name: "Feb", appointment: 20, completed: 15 },
            ]}
          />

        </div>

        <div className="bg-white rounded-xl p-4 mt-8">
          <RecentAppointments data={last5Records} />
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-[30%]">
        <div className="w-full h-112.5 mb-8">
          <StatSummary data={appointmentCounts} total={totalAppointment} />
        </div>

        <AvailableDoctors data={availableDoctors as any} />
      </div>
    </div>
  );
};

export default DoctorDashboard;
