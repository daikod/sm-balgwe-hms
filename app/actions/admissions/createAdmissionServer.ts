'use server';

import { requireRole } from '@/lib/auth/requireRole';
import { createAdmission } from './createAdmission';

export interface CreateAdmissionClientInput {
  patientId: string;
  chiefComplaint: string;
  provisionalDiagnosis: string;
  initialTherapyPlan?: string;
  bedId?: number;
  referralDoctor?: string;
  appointmentId?: string;
}

export async function createAdmissionServer(input: CreateAdmissionClientInput) {
  /* =========================
     Auth — DOCTOR only
  ========================= */
  const { userId: doctorId } = await requireRole(['DOCTOR']);

  return createAdmission({
    ...input,
    admittingDoctorId: doctorId,
  });
}
