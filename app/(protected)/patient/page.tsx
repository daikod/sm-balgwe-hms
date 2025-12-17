

import React from "react";
import { AvailableDoctors } from "@/components/available-doctor";
import { AppointmentChart } from "@/components/charts/appointment-chart";
import { StatSummary } from "@/components/charts/stat-summary";
import { PatientRatingContainer } from "@/components/patient-rating-container";
import { StatCard } from "@/components/stat-card";
import { RecentAppointments } from "@/components/tables/recent-appointment";
import { Button } from "@/components/ui/button";
import { Appointment, DoctorInfo } from "@/types/appointment";
import { getPatientDashboardStatistics, getPatientById } from "@/utils/services/patient";
import { getDoctors } from "@/utils/services/doctor";
import { currentUser } from "@clerk/nextjs/server";
import { Briefcase, BriefcaseBusiness, BriefcaseMedical } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookAppointmentButton } from "@/components/patient/book-appointment-button";


const PatientDashboard = async () => {
  const user = await currentUser();
  if (!user?.id) redirect("/sign-in");

  const { data: patientData } = await getPatientById(user.id);
  const { data: doctors = [] } = await getDoctors(); // Prisma doctors
  const { data, appointmentCounts, last5Records, totalAppointments, monthlyData } =
    await getPatientDashboardStatistics(user.id);

  if (!data || !patientData) return null;

  // Map last 5 appointments
  const mappedAppointments: Appointment[] = last5Records.map((a: any) => ({
    id: a.id,
    roomID: a.roomID || "",
    appointment_date: a.appointment_date,
    time: a.time,
    status: a.status as Appointment["status"],
    duration: a.duration || 0,
    type: (a.type as Appointment["type"]) || "PHYSICAL",
    patient: a.patient
      ? {
          id: a.patient.id,
          first_name: a.patient.first_name,
          last_name: a.patient.last_name,
          gender: a.patient.gender,
          img: a.patient.img || null,
          colorCode: a.patient.colorCode || null,
        }
      : null,
    doctor: a.doctor
      ? {
          id: a.doctor.id,
          name: a.doctor.name,
          specialization: a.doctor.specialization,
          img: a.doctor.img || null,
          colorCode: a.doctor.colorCode || null,
        } as DoctorInfo
      : null,
  }));

  const cardData = [
    {
      title: "appointments",
      value: totalAppointments,
      icon: Briefcase,
      className: "bg-blue-600/15",
      iconClassName: "bg-blue-600/25 text-blue-600",
      note: "Total appointments",
    },
    {
      title: "cancelled",
      value: appointmentCounts?.CANCELLED || 0,
      icon: Briefcase,
      className: "bg-rose-600/15",
      iconClassName: "bg-rose-600/25 text-rose-600",
      note: "Cancelled Appointments",
    },
    {
      title: "pending",
      value:
        (appointmentCounts?.PENDING || 0) +
        (appointmentCounts?.SCHEDULED || 0),
      icon: BriefcaseBusiness,
      className: "bg-yellow-600/15",
      iconClassName: "bg-yellow-600/25 text-yellow-600",
      note: "Pending Appointments",
    },
    {
      title: "completed",
      value: appointmentCounts?.COMPLETED || 0,
      icon: BriefcaseMedical,
      className: "bg-emerald-600/15",
      iconClassName: "bg-emerald-600/25 text-emerald-600",
      note: "Completed Appointments",
    },
  ];

  return (
    <div className="py-6 px-3 flex flex-col rounded-xl xl:flex-row gap-6">
      {/* LEFT */}
      <div className="w-full xl:w-[69%]">
        <div className="bg-white rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg xl:text-2xl font-semibold">
              Welcome {data.first_name || user.firstName}
            </h1>

            <div className="space-x-2 flex items-center">
              {/* Book Appointment Button */}
              <BookAppointmentButton patientData={patientData} doctors={doctors} />

              <Button size="sm">{new Date().getFullYear()}</Button>
              <Button size="sm" variant="outline" className="hover:underline">
                <Link href="/patient/self">View Profile</Link>
              </Button>
            </div>
          </div>

          <div className="w-full flex flex-wrap gap-5">
            {cardData.map((el, idx) => (
              <StatCard key={idx} {...el} link="#" />
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
          <RecentAppointments data={mappedAppointments} />
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-[30%]">
        <div className="w-full h-112.5 mb-8">
          <StatSummary data={appointmentCounts} total={totalAppointments} />
        </div>

        <AvailableDoctors data={doctors} />

        <PatientRatingContainer />
      </div>
    </div>
  );
};

export default PatientDashboard;
