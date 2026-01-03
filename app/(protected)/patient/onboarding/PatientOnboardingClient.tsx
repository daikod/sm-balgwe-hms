"use client";
import React from "react";
import { NewPatient } from "@/components/new-patient";
import { completePatientOnboarding } from "./completePatientOnboarding";

export default function PatientOnboardingClient({
  data,
  userId,
}: {
  data: any;
  userId: string;
}) {
  const handleComplete = async () => {
    await completePatientOnboarding(userId);
    window.location.href = "/patient/dashboard";
  };

  return <NewPatient
   data={data} 
   type={data ? "update" : "create"} 
   onComplete={async () => {
    const result = await completePatientOnboarding(userId);
    if (result.success) {
      // Redirect user after completion
      window.location.href = '/patient/dashboard';
    }
  }}
/>;
}
