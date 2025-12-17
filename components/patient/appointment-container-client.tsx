"use client";

import React, { Suspense } from "react";
import { AppointmentContainerServer } from "./appointment-container-server";

interface Props {
  patientId: string;
}

export const AppointmentContainerClient = ({ patientId }: Props) => {
  return (
    <Suspense fallback={<div>Loading booking form...</div>}>
      <AppointmentContainerServer patientId={patientId} />
    </Suspense>
  );
};
