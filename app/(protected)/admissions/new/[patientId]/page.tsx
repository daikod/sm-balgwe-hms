// app/(protected)/admissions/new/[patientId]/page.tsx

import db from '@/lib/db';
import AdmissionForm from '@/components/forms/AdmissionForm';
import { auth } from '@clerk/nextjs/server';

export default async function NewAdmissionPage({ params }: any) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  /* ================= PATIENT ================= */
  const patient = await db.patient.findUnique({
    where: { id: params.patientId },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      date_of_birth: true,
      gender: true,
    },
  });

  if (!patient) {
    throw new Error('Patient not found');
  }

  const safePatient = {
    ...patient,
    date_of_birth: patient.date_of_birth?.toISOString() ?? null,
  };

  /* ================= UNITS + BEDS ================= */
  const units = await db.inpatientUnit.findMany({
    include: {
      beds: {
        where: { isActive: true },
        select: {
          id: true,
          unitId: true,
          bedNumber: true,
          isActive: true,
        },
      },
    },
  });

  return (
    <AdmissionForm
      patient={safePatient}
      units={units}
      currentDoctorId={userId}
    />
  );
}
