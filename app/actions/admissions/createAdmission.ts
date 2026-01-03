'use server';

import db from '@/lib/db';

export interface CreateAdmissionInput {
  patientId: string;
  chiefComplaint: string;
  provisionalDiagnosis: string;
  initialTherapyPlan?: string;
  admittingDoctorId: string;
  referralDoctor?: string;
  bedId?: number;
  // appointmentId removed (not supported by schema)
}

export async function createAdmission(input: CreateAdmissionInput) {
  return await db.$transaction(async (tx) => {
    // 1️⃣ Enforce single ACTIVE admission
    const existingAdmission = await tx.admission.findFirst({
      where: {
        patientId: input.patientId,
        status: 'ACTIVE',
      },
      select: { id: true },
    });

    if (existingAdmission) {
      throw new Error('Patient already has an active admission.');
    }

    // 2️⃣ Create admission
    const admission = await tx.admission.create({
      data: {
        patientId: input.patientId,
        chiefComplaint: input.chiefComplaint,
        provisionalDiagnosis: input.provisionalDiagnosis,
        initialTherapyPlan: input.initialTherapyPlan,
        admittingDoctorId: input.admittingDoctorId,
        referralDoctor: input.referralDoctor,
        status: 'ACTIVE',
      },
    });

    // 3️⃣ Bed allocation (safe)
    if (input.bedId) {
      const bedInUse = await tx.bedAllocation.findFirst({
        where: {
          bedId: input.bedId,
          releasedAt: null,
        },
      });

      if (bedInUse) {
        throw new Error('Selected bed is already occupied.');
      }

      await tx.bedAllocation.create({
        data: {
          admissionId: admission.id,
          bedId: input.bedId,
          assignedAt: new Date(),
        },
      });
    }

    return admission;
  });
}
