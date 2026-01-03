'use server';

import db from '@/lib/db';

interface CreateInpatientPrescriptionInput {
  patientId: string;
  doctorId: string;
  appointmentId: number;
  diagnosis: string;
  instructions?: string;
  notes?: string;
}

export async function createInpatientPrescription(
  input: CreateInpatientPrescriptionInput
) {
  // Validate appointment + medical record
  const medical = await db.medicalRecords.findFirst({
    where: {
      appointmentId: input.appointmentId,
      patientId: input.patientId,
    },
    select: { id: true },
  });

  if (!medical) {
    throw new Error('Medical record not found for admission');
  }

  return db.prescription.create({
    data: {
      patientId: input.patientId,
      doctorId: input.doctorId,
      appointmentId: input.appointmentId,
      diagnosis: input.diagnosis,
      instructions: input.instructions,
      notes: input.notes,
    },
  });
}
