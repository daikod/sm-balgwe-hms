// app/(protected)/admissions/[admissionId]/discharge/page.tsx

import db from '@/lib/db';
import DischargeForm from '@/components/forms/DischargeForm';
import { requireRole } from '@/lib/auth/requireRole';
import { Prisma } from '@prisma/client';

type AdmissionWithPatient = Prisma.AdmissionGetPayload<{
  include: {
    patient: {
      select: {
        first_name: true;
        last_name: true;
        email: true;
      };
    };
  };
}>;

export default async function DischargePage({ params }: any) {
  // 🔐 Only clinical/admin roles may discharge
  await requireRole(['DOCTOR', 'NURSE', 'ADMIN']);

  const admissionId = Number(params.admissionId);

  const admission: AdmissionWithPatient | null =
    await db.admission.findUnique({
      where: { id: admissionId },
      include: {
        patient: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });

  if (!admission) {
    throw new Error('Admission not found');
  }

  return (
    <DischargeForm
      admissionId={admission.id}
      patientName={`${admission.patient.first_name} ${admission.patient.last_name}`}
    />
  );
}
