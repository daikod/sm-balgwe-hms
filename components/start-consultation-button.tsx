"use client";

import { Button } from "./ui/button";
import { Video } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StartConsultationButton({
  appointmentId,
  variant = "default",
}: {
  appointmentId: number;
  variant?: "default" | "outline";
}) {
  const router = useRouter();

  const startConsultation = async () => {
    const res = await fetch("/api/appointments/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId }),
    });

    const data = await res.json();

    if (data?.roomID) {
      router.push(`/meeting/${data.roomID}`);
    }
  };

  return (
    <Button
      size="sm"
      variant={variant}
      className="w-full justify-start gap-2"
      onClick={startConsultation}
    >
      <Video size={16} />
      {variant === "default" ? "Start Consultation" : "Rejoin Consultation"}
    </Button>
  );
}
