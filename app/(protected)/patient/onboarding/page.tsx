'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { NewPatient } from "@/components/new-patient";
import { completePatientOnboarding } from "./completePatientOnboarding";

export default function PatientOnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.replace("/sign-in");
      return;
    }

    const loadPatient = async () => {
      try {
        const res = await fetch(`/api/patient/${user.id}`);
        const result = await res.json();

        // Already onboarded → go to dashboard
        if (result?.data?.first_name && result?.data?.date_of_birth) {
          router.replace("/patient/dashboard");
          return;
        }

        setData(result?.data ?? null);
      } catch (err) {
        console.error(err);
      }
    };

    loadPatient();
  }, [isLoaded, user, router]);

  if (!isLoaded) return null;

  return (
    <div className="w-full h-full flex justify-center">
      <div className="max-w-6xl w-full relative pb-10">
        <NewPatient
          data={data}
          type={data ? "update" : "create"}
          onComplete={async () => {
            if (!user) return;

            await completePatientOnboarding(user.id);
            router.replace("/patient/dashboard");
          }}
        />
      </div>
    </div>
  );
}
