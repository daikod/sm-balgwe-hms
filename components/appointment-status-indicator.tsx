import { cn } from "@/lib/utils";

type AppointmentStatus = "PENDING" | "SCHEDULED" | "CANCELLED" | "COMPLETED" | "IN_PROGRESS";

const status_color: Record<AppointmentStatus, string> = {
  PENDING: "bg-yellow-600/15 text-yellow-600",
  SCHEDULED: "bg-emerald-600/15 text-emerald-600",
  CANCELLED: "bg-red-600/15 text-red-600",
  COMPLETED: "bg-blue-600/15 text-blue-600",
  IN_PROGRESS: "bg-green-500/15 text-purple-600",
};

export const AppointmentStatusIndicator = ({
  status,
}: {
  status: AppointmentStatus;
}) => {
  return (
    <p
      className={cn(
        "w-fit px-2 py-1 rounded-full capitalize text-xs lg:text-sm",
        status_color[status]
      )}
    >
      {status}
    </p>
  );
};