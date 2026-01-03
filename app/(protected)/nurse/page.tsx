// app/(protected)/nurse/dashboard.tsx

// Import relevant components
import { StatCard } from "@/components/stat-card";
import { RecentAppointments } from "@/components/tables/recent-appointment";
import { Button } from "@/components/ui/button";
import { getNurseDashboardStats } from "@/utils/services/nurse"; // Custom API call to fetch nurse stats
import { User, Users, BriefcaseMedical } from "lucide-react";
import React from "react";

const NurseDashboard = async () => {
  const {
    totalPatients,
    totalInpatients,
    totalAppointments,
    recentAppointments,
  } = await getNurseDashboardStats();

  // Card data for the nurse dashboard
  const cardData = [
    {
      title: "Patients",
      value: totalPatients ?? 0,
      icon: Users,
      className: "bg-blue-600/15",
      iconClassName: "bg-blue-600/25 text-blue-600",
      note: "Total patients",
      link: "/nurse/manage-patients", // Link to manage patients
    },
    {
      title: "Inpatients",
      value: totalInpatients ?? 0,
      icon: BriefcaseMedical,
      className: "bg-yellow-600/15",
      iconClassName: "bg-yellow-600/25 text-yellow-600",
      note: "Total inpatients",
      link: "/nurse/manage-inpatients", // Link to manage inpatients
    },
    {
      title: "Appointments",
      value: totalAppointments ?? 0,
      icon: User,
      className: "bg-emerald-600/15",
      iconClassName: "bg-emerald-600/25 text-emerald-600",
      note: "Total appointments",
      link: "/nurse/manage-appointments", // Link to manage appointments
    },
  ];

  return (
    <div className="py-6 px-3 flex flex-col xl:flex-row rounded-xl gap-6">
      {/* LEFT */}
      <div className="w-full xl:w-[69%]">
        <div className="bg-white rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold">Nurse Dashboard</h1>
            <Button size="sm" variant="outline">
              {new Date().getFullYear()}
            </Button>
          </div>

          <div className="flex flex-wrap gap-5">
            {cardData.map((el, i) => (
              <StatCard
                key={i}
                title={el.title}
                value={el.value}
                icon={el.icon}
                className={el.className}
                iconClassName={el.iconClassName}
                note={el.note}
                link={el.link}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 mt-8">
          <RecentAppointments
            data={recentAppointments}
            userId="nurse"
            isAdmin={false}
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-[30%]">
        {/* Nurse-specific summary or additional components */}
      </div>
    </div>
  );
};

export default NurseDashboard;
