import React from "react";
import { BookAppointment } from "@/components/forms/book-appointment";
import { getPatientById } from "@/utils/services/patient";
import { getDoctors } from "@/utils/services/doctor";

interface Props {
  patientId: string;
}

export const AppointmentContainerServer = async ({ patientId }: Props) => {
  const { data: patient } = await getPatientById(patientId);
  const { data: doctors } = await getDoctors();

  if (!patient || !doctors) return null;

  return <BookAppointment data={patient} doctors={doctors} />;
};
