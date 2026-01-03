'use server';

import db from '@/lib/db';

interface RecordVitalSignsInput {
  medicalId: number;
  patientId: string;

  body_temperature: number;
  systolic: number;
  diastolic: number;
  heartRate: string;

  respiratory_rate?: number;
  oxygen_saturation?: number;
  weight: number;
  height: number;
}

export async function recordVitalSigns(input: RecordVitalSignsInput) {
  // Validate Medical Record exists
  const medical = await db.medicalRecords.findUnique({
    where: { id: input.medicalId },
    select: { id: true },
  });

  if (!medical) {
    throw new Error('Medical record not found');
  }

  return db.vitalSigns.create({
    data: {
      medicalId: input.medicalId,
      patientId: input.patientId,

      body_temperature: input.body_temperature,
      systolic: input.systolic,
      diastolic: input.diastolic,
      heartRate: input.heartRate,
      respiratory_rate: input.respiratory_rate,
      oxygen_saturation: input.oxygen_saturation,
      weight: input.weight,
      height: input.height,
    },
  });
}
