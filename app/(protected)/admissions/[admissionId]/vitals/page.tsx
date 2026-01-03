// app/(protected)/admissions/[admissionId]/vitals/page.tsx

import db from '@/lib/db';
import RecordVitalsForm from '@/components/forms/RecordVitalsForm';
import { requireRole } from '@/lib/auth/requireRole';

export default async function VitalsPage({ params }: any) {
  // 🔐 Nurses, doctors, and admins can record vitals
  await requireRole(['NURSE', 'DOCTOR', 'ADMIN']);

  const admissionId = Number(params.admissionId);

  const admission = await db.admission.findUnique({
    where: { id: admissionId },
    select: {
      medicalRecordId: true,
      patient: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
    },
  });

  if (!admission || !admission.medicalRecordId || !admission.patient) {
    throw new Error('Admission or medical record not found');
  }

  const vitals = await db.vitalSigns.findMany({
    where: { medicalId: admission.medicalRecordId },
    orderBy: { created_at: 'desc' },
    take: 20,
  });

  const safeVitals = vitals.map((v: any) => ({
    id: v.id,
    body_temperature: v.body_temperature,
    systolic: v.systolic,
    diastolic: v.diastolic,
    heartRate: v.heartRate,
    respiratory_rate: v.respiratory_rate ?? undefined,
    oxygen_saturation: v.oxygen_saturation ?? undefined,
    weight: v.weight,
    height: v.height,
    created_at: v.created_at.toISOString(),
  }));

  return (
    <RecordVitalsForm
      medicalId={admission.medicalRecordId}
      patientId={admission.patient.id}
      patientName={`${admission.patient.first_name} ${admission.patient.last_name}`}
      vitals={safeVitals}
    />
  );
}
