// app/(protected)/admissions/[admissionId]/assign-bed/page.tsx

import db from '@/lib/db';
import AssignBedForm from '@/components/forms/AssignBedForm';
import { requireRole } from '@/lib/auth/requireRole';

export default async function AssignBedPage({ params }: any) {
  await requireRole(['NURSE', 'ADMIN']);

  const admissionId = Number(params.admissionId);

  const admission = await db.admission.findUnique({
    where: { id: admissionId },
    include: {
      patient: {
        select: {
          first_name: true,
          last_name: true,
        },
      },
    },
  });

  if (!admission) {
    throw new Error('Admission not found');
  }

  const units = await db.inpatientUnit.findMany({
    include: {
      beds: {
        where: { isActive: true },
      },
    },
  });

  return (
    <AssignBedForm
      admissionId={admission.id}
      patientName={`${admission.patient.first_name} ${admission.patient.last_name}`}
      units={units}
    />
  );
}
