import db from "@/lib/db";
import React from "react";
import { MedicalHistory } from "@/components/medical-history";

interface DataProps {
  id?: number | string;
  patientId: string;
}

export const MedicalHistoryContainer = async ({ id, patientId }: DataProps) => {
  const data = await db.medicalRecords.findMany({
    where: { patientId: patientId },
    include: {
      diagnosis: { include: { doctor: true } },
      lab_test: true,
    },

    orderBy: { created_at: "desc" },
  });
  return (
    <>
      <MedicalHistory data={data} isShowProfile={false} />
    </>
  );
};