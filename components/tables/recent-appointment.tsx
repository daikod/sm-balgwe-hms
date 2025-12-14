import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { Table } from "./table";
import { Appointment } from "@/types/appointment";
import { ProfileImage } from "@/components/profile-image";
import { format } from "date-fns";
import { AppointmentStatusIndicator } from "@/components/appointment-status-indicator";
import ViewAppointmentDialog from "@/components/view-appointment-dialog";
import { auth } from "@clerk/nextjs/server";
import { checkRole } from "@/utils/roles";
import { getAppointmentById } from "@/utils/services/appointment";

interface DataProps {
  data: Appointment[];
}

// Optional: updated ProfileImageProps for safety
interface ProfileImageProps {
  url?: string;
  name?: string;
  className?: string;
  textClassName?: string;
  bgColor?: string;
}

const columns = [
  { header: "Info", key: "name" },
  { header: "Date", key: "appointment_date", className: "hidden md:table-cell" },
  { header: "Time", key: "time", className: "hidden md:table-cell" },
  { header: "Doctor", key: "doctor", className: "hidden md:table-cell" },
  { header: "Status", key: "status", className: "hidden xl:table-cell" },
  { header: "Actions", key: "action" },
];

export const RecentAppointments = async ({ data }: DataProps) => {
  const { userId } = await auth();
  const isAdmin = await checkRole("ADMIN");

  const renderRow = (item: Appointment) => {
    // Safe fallback values
    const patientName =
      (item.patient?.first_name ?? "") + " " + (item.patient?.last_name ?? "");
    const doctorName = item.doctor?.name ?? "";
    const patientImg = item.patient?.img ?? "";
    const doctorImg = item.doctor?.img ?? "";
    const patientBgColor = (item.patient as any)?.colorCode ?? "bg-gray-400";
    const doctorBgColor = (item.doctor as any)?.colorCode ?? "bg-gray-400";
    const patientGender = item.patient?.gender?.toLowerCase() ?? "";

    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50"
      >
        <td className="flex items-center gap-2 2xl:gap-4 py-2 xl:py-4">
          <ProfileImage
            url={patientImg}
            name={patientName || "Unknown"}
            className="bg-violet-600"
            bgColor={patientBgColor}
          />
          <div>
            <h3 className="text-sm md:text-base md:font-medium uppercase">{patientName || "Unknown"}</h3>
            <span className="text-xs capitalize">{patientGender}</span>
          </div>
        </td>

        <td className="hidden md:table-cell">{format(item.appointment_date, "yyyy-MM-dd")}</td>
        <td className="hidden md:table-cell">{item.time}</td>
        <td className="hidden md:table-cell items-center py-2">
          <div className="flex items-center gap-2 2xl:gap-4">
            <ProfileImage
              url={doctorImg}
              name={doctorName || "Unknown"}
              className="bg-blue-600"
              bgColor={doctorBgColor}
              textClassName="text-black font-medium"
            />
            <div>
              <h3 className="font-medium uppercase">{doctorName || "Unknown"}</h3>
              <span className="text-xs capitalize">{item.doctor?.specialization ?? ""}</span>
            </div>
          </div>
        </td>

        <td className="hidden xl:table-cell">
          <AppointmentStatusIndicator status={item.status} />
        </td>

        <td>
          <div className="flex items-center gap-x-2">
            <ViewAppointmentDialog data={item} userId={userId} isAdmin={isAdmin} />
            <Link href={`/record/appointments/${item.id}`}>See all</Link>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-xl p-2 2xl:p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Recent Appointments</h1>
        <Button asChild variant={"outline"}>
          <Link href="/record/appointments">View All</Link>
        </Button>
      </div>

      <Table columns={columns} renderRow={renderRow} data={data} />
    </div>
  );
};
