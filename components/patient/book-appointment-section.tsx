"use client";

import React from "react";
import { BookAppointment } from "../forms/book-appointment";
import { Patient, Doctor, JOBTYPE } from "@prisma/client";
import availableDays from '@/components/available-doctor';

interface Props {
  patientData: Patient;
  doctors: Doctor[]; // full Prisma Doctor
}

const BookAppointmentSection: React.FC<Props> = ({ patientData, doctors }) => {
  // ADAPTER: Ensure all required fields exist
  const adaptedDoctors: Doctor[] = doctors.map((doc) => ({
    id: doc.id,
    name: doc.name,
    specialization: doc.specialization,
    email: doc.email ?? "",
    phone: doc.phone ?? "",
    gender: doc.gender ?? null,
    address: doc.address ?? "",
    img: doc.img ?? null,
    colorCode: doc.colorCode ?? null,
    license_number: doc.license_number ?? "",
    department: doc.department ?? null,
    availability_status: doc.availability_status ?? "AVAILABLE",
    type: doc.type ?? JOBTYPE.FULL,
    created_at: doc.created_at ?? new Date(),
    updated_at: doc.updated_at ?? new Date(),
    working_days: doc.availability_status?? [], // Include working_days
  }));

  return <BookAppointment data={patientData} doctors={adaptedDoctors} />;
};

export default BookAppointmentSection;
