'use server';

import db from "@/lib/db";

interface AddMedicationInput {
  prescriptionId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: string;
  instructions?: string;
}

export async function addMedicationToPrescription(
  input: AddMedicationInput
) {
  const prescription = await db.prescription.findUnique({
    where: { id: input.prescriptionId },
    select: { status: true },
  });

  if (!prescription || prescription.status !== 'active') {
    throw new Error('Prescription is not active');
  }

  return db.medication.create({
    data: {
      prescriptionId: input.prescriptionId,
      medicationName: input.medicationName,
      dosage: input.dosage,
      frequency: input.frequency,
      duration: input.duration,
      quantity: input.quantity,
      instructions: input.instructions,
    },
  });
}
