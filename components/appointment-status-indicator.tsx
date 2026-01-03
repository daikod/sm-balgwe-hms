import { AppointmentStatus } from "@prisma/client";

interface Props {
  status: AppointmentStatus;
}

export const AppointmentStatusIndicator = ({ status }: Props) => {
  const statusMap: Record<AppointmentStatus, { label: string; color: string }> =
    {
      PENDING: {
        label: "Pending",
        color: "bg-yellow-100 text-yellow-800",
      },
      SCHEDULED: {
        label: "Scheduled",
        color: "bg-blue-100 text-blue-800",
      },
      IN_PROGRESS: {
        label: "In Progress",
        color: "bg-indigo-100 text-indigo-800",
      },
      COMPLETED: {
        label: "Completed",
        color: "bg-green-100 text-green-800",
      },
      CANCELLED: {
        label: "Cancelled",
        color: "bg-red-100 text-red-800",
      },
      READY_FOR_ADMISSION: {
        label: "Ready for Admission",
        color: "bg-purple-100 text-purple-800",
      },
      MISSED: {
        label: "Missed Recent Appointment",
        color: "bg-red-600 text-white-600",
      }
    };

  const config = statusMap[status];

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
};
