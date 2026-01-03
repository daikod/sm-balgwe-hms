// app/(protected)/admissions/[admissionId]/treatments/page.tsx

import db from '@/lib/db';
import TreatmentChart from '@/components/charts/TreatmentChart';

export default async function TreatmentsPage({ params }: any) {
  const admissionId = Number(params.admissionId);

  const admission = await db.admission.findUnique({
    where: { id: admissionId },
    include: {
      medicalRecord: {
        select: {
          appointmentId: true,
          patientId: true,
        },
      },
    },
  });

  if (!admission?.medicalRecord) {
    throw new Error('Admission medical record not found');
  }

  const prescriptions = await db.prescription.findMany({
    where: {
      appointmentId: admission.medicalRecord.appointmentId,
      patientId: admission.medicalRecord.patientId,
    },
    include: {
      medications: {
        include: {
          administrations: {
            orderBy: { administeredAt: 'desc' },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const safePrescriptions = prescriptions.map(p => ({
    id: p.id,
    diagnosis: p.diagnosis,
    instructions: p.instructions,
    status: p.status,
    medications: p.medications.map(m => ({
      id: m.id,
      medicationName: m.medicationName,
      dosage: m.dosage,
      frequency: m.frequency,
      status: m.status,
      administrations: m.administrations.map(a => ({
        id: a.id,
        dosageGiven: a.dosageGiven,
        administeredAt: a.administeredAt.toISOString(),
        administeredBy: a.administeredBy,
      })),
    })),
  }));

  return (
    <TreatmentChart
      admissionId={admissionId}
      patientId={admission.medicalRecord.patientId}
      prescriptions={safePrescriptions}
    />
  );
}
