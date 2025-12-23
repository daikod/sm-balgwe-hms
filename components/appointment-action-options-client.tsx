// components/appointment/appointment-action-options-client.tsx
"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { EllipsisVertical, User } from "lucide-react";
import Link from "next/link";
import { AppointmentStatus } from "@prisma/client";
import { AppointmentActionDialog } from "./appointment-action-dialog";
import StartConsultationButton from "./start-consultation-button";

interface Props {
  appointmentId: number;
  patientId: string;
  doctorId: string;
  status: AppointmentStatus;
  isAdmin: boolean;
  isDoctor: boolean;
  userId: string;
}

const AppointmentActionOptionsClient = ({
  appointmentId,
  patientId,
  doctorId,
  status,
  isAdmin,
  isDoctor,
  userId,
}: Props) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center justify-center rounded-full p-1">
          <EllipsisVertical size={16} className="text-gray-500" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-60 p-3">
        <div className="flex flex-col items-start space-y-3">
          <span className="text-gray-400 text-xs">Perform Actions</span>

          {/* VIEW DETAILS */}
          <Button size="sm" variant="ghost" className="w-full justify-start" asChild>
            <Link href={`/record/appointments/${appointmentId}`}>
              <User size={16} /> View Full Details
            </Link>
          </Button>

          {/* START/REJOIN CONSULTATION */}
          {isDoctor && (status === AppointmentStatus.SCHEDULED || status === AppointmentStatus.IN_PROGRESS) && (
            <StartConsultationButton
              appointmentId={appointmentId}
              variant={status === AppointmentStatus.SCHEDULED ? "default" : "outline"}
            />
          )}

          {/* APPROVE */}
          {status !== AppointmentStatus.SCHEDULED && (
            <AppointmentActionDialog
              type="approve"
              id={appointmentId}
              disabled={!(isAdmin || isDoctor)}
            />
          )}

          {/* CANCEL */}
          <AppointmentActionDialog
            type="cancel"
            id={appointmentId}
            disabled={
              status === AppointmentStatus.PENDING &&
              !(isAdmin || isDoctor || userId === patientId)
            }
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AppointmentActionOptionsClient;
