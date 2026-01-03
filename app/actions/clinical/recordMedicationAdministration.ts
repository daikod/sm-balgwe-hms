'use server';

import db from "@/lib/db";

export async function recordMedicationAdministration(
  medicationId: string,
  patientId: string,
  administeredBy: string,
  administeredByRole: string,
  dosageGiven: string,
  notes?: string
) {
  const medication = await db.medication.findUnique({
    where: { id: medicationId },
    select: { status: true },
  });

  if (!medication || medication.status === 'completed') {
    throw new Error('Medication is not active');
  }

  return db.medicationAdministration.create({
    data: {
      medicationId,
      patientId,
      administeredBy,
      administeredByRole,
      dosageGiven,
      notes,
      status: 'administered',
    },
  });
}
