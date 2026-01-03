"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { appointmentAction } from "@/app/actions/appointment";

// ✅ Define AppointmentStatus enum locally to avoid Prisma import in client
export enum AppointmentStatusEnum {
  PENDING = "PENDING",
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

interface Props {
  id: string | number;
  status: AppointmentStatusEnum;
}

export const AppointmentAction = ({ id, status }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<AppointmentStatusEnum | null>(null);
  const [reason, setReason] = useState("");
  const router = useRouter();

  const handleAction = async () => {
    if (!selected) return;

    try {
      setIsLoading(true);

      const newReason =
        reason || `Appointment has been ${selected.toLowerCase()} on ${new Date()}`;

      const resp = await appointmentAction(id, selected, newReason);

      if (resp.success) {
        toast.success(resp.msg);
        router.refresh();
      } else {
        toast.error(resp.msg);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-3">
        {Object.values(AppointmentStatusEnum).map((statusOption) => (
          <Button
            key={statusOption}
            variant="outline"
            disabled={
              isLoading ||
              status === AppointmentStatusEnum.COMPLETED ||
              status === AppointmentStatusEnum.CANCELLED
            }
            onClick={() => setSelected(statusOption)}
          >
            {statusOption}
          </Button>
        ))}
      </div>

      {selected === AppointmentStatusEnum.CANCELLED && (
        <Textarea
          disabled={isLoading}
          className="mt-4"
          placeholder="Enter reason..."
          onChange={(e) => setReason(e.target.value)}
        />
      )}

      {selected && (
        <div className="flex items-center justify-between mt-6 bg-red-100 p-4 rounded">
          <p>Are you sure you want to perform this action?</p>
          <Button disabled={isLoading} onClick={handleAction}>
            Yes
          </Button>
        </div>
      )}
    </div>
  );
};
