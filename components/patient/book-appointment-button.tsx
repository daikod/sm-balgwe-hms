"use client";

import React from "react";
import { Patient, Doctor } from "@prisma/client";
import { BookAppointment, FullDoctor } from "@/components/forms/book-appointment";

interface Props {
  patientData: Patient;
  doctors: Doctor[];
}

export const BookAppointmentButton = ({ patientData, doctors }: Props) => {
  // Map doctors to FullDoctor type for type safety
  const mappedDoctors: FullDoctor[] = doctors.map((d) => ({
    ...d,
    email: d.email ?? "",
    gender: d.gender ?? null,
    phone: d.phone ?? "",
    address: d.address ?? "",
    license_number: d.license_number ?? "",
    department: d.department ?? null,
    availability_status: d.availability_status ?? null,
    type: d.type ?? "GENERAL",
    colorCode: d.colorCode ?? "#ccc",
  }));

  return <BookAppointment data={patientData} doctors={mappedDoctors} />;
};
