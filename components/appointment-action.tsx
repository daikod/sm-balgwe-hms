"use client";

import { AppointmentStatus } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useRouter } from "next/navigation";
import { appointmentAction } from "@/app/actions/appointment";

interface ActionProps {
  id: string | number;
  status: AppointmentStatus; // ✅ FIX
}

export const AppointmentAction = ({ id, status }: ActionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<AppointmentStatus | null>(null);
  const [reason, setReason] = useState("");
  const router = useRouter();

  const handleAction = async () => {
    if (!selected) return;

    try {
      setIsLoading(true);

      const newReason =
        reason ||
        `Appointment has been ${selected.toLowerCase()} on ${new Date()}`;

      const resp = await appointmentAction(id, selected, newReason);

      if (resp.success) {
        toast.success(resp.msg);
        router.refresh();
      } else {
        toast.error(resp.msg);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          disabled={status === AppointmentStatus.PENDING || isLoading || status === AppointmentStatus.COMPLETED}
          onClick={() => setSelected(AppointmentStatus.PENDING)}
        >
          Pending
        </Button>

        <Button
          variant="outline"
          disabled={status === AppointmentStatus.SCHEDULED || isLoading || status === AppointmentStatus.COMPLETED}
          onClick={() => setSelected(AppointmentStatus.SCHEDULED)}
        >
          Approve
        </Button>

        <Button
          variant="outline"
          disabled={status === AppointmentStatus.COMPLETED || isLoading}
          onClick={() => setSelected(AppointmentStatus.COMPLETED)}
        >
          Completed
        </Button>

        <Button
          variant="outline"
          disabled={status === AppointmentStatus.CANCELLED || isLoading || status === AppointmentStatus.COMPLETED}
          onClick={() => setSelected(AppointmentStatus.CANCELLED)}
        >
          Cancel
        </Button>
      </div>

      {selected === AppointmentStatus.CANCELLED && (
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
