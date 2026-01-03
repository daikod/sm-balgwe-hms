"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Check, Ban } from "lucide-react";
import { MdCancel } from "react-icons/md";
import { GiConfirmed } from "react-icons/gi";
import { cn } from "@/lib/utils";
import { appointmentAction } from "@/app/actions/appointment";

// ✅ Local enum to replace Prisma enum for client-side
export enum AppointmentStatusEnum {
  PENDING = "PENDING",
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

interface Props {
  type: "approve" | "cancel";
  id: string | number;
  disabled: boolean;
}

export const AppointmentActionDialog = ({ type, id, disabled }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState("");
  const router = useRouter();

  const handleAction = async () => {
    if (type === "cancel" && !reason) {
      toast.error("Please provide a reason for cancellation.");
      return;
    }

    try {
      setIsLoading(true);

      const newReason =
        reason ||
        `Appointment has been ${
          type === "approve" ? "scheduled" : "cancelled"
        } on ${new Date()}`;

      const resp = await appointmentAction(
        id,
        type === "approve"
          ? AppointmentStatusEnum.SCHEDULED
          : AppointmentStatusEnum.CANCELLED,
        newReason
      );

      if (resp.success) {
        toast.success(resp.msg);
        setReason("");
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
    <Dialog>
      <DialogTrigger asChild disabled={!disabled}>
        <Button
          size="sm"
          variant={type === "approve" ? "ghost" : "outline"}
          className={cn(
            "w-full justify-start",
            type === "cancel" && "text-red-500"
          )}
        >
          {type === "approve" ? <Check size={16} /> : <Ban size={16} />}{" "}
          {type === "approve" ? "Approve" : "Cancel"}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <div className="flex flex-col items-center py-6">
          <DialogTitle>
            <div
              className={cn(
                "p-4 rounded-full mb-2",
                type === "approve" ? "bg-emerald-200" : "bg-red-200"
              )}
            >
              {type === "approve" ? (
                <GiConfirmed size={50} className="text-emerald-500" />
              ) : (
                <MdCancel size={50} className="text-red-500" />
              )}
            </div>
          </DialogTitle>

          <span className="text-xl text-black">
            Appointment {type === "approve" ? "Confirmation" : "Cancellation"}
          </span>
          <p className="text-sm text-center text-gray-500">
            {type === "approve"
              ? "You're about to confirm this appointment. Yes to approve or No to cancel."
              : "Are you sure you want to cancel this appointment?"}
          </p>

          {type === "cancel" && (
            <Textarea
              disabled={isLoading}
              className="mt-4"
              placeholder="Cancellation reason..."
              onChange={(e) => setReason(e.target.value)}
            />
          )}

          <div className="flex justify-center mt-6 items-center gap-x-4">
            <Button
              disabled={isLoading}
              onClick={handleAction}
              variant="outline"
              className={cn(
                "px-4 py-2 text-sm font-medium text-white",
                type === "approve"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-destructive hover:bg-destructive"
              )}
            >
              Yes, {type === "approve" ? "Approve" : "Cancel"}
            </Button>
            <DialogClose asChild>
              <Button
                variant="outline"
                className="px-4 py-2 text-sm underline text-gray-500"
              >
                No
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
