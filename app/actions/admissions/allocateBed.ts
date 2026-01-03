// app/actions/admissions/allocateBed.ts
'use server';

import db from '@/lib/db';

export async function allocateBed(
  admissionId: number,
  bedId: number
) {
  return db.$transaction(async (tx) => {
    const admission = await tx.admission.findUnique({
      where: { id: admissionId },
      select: { status: true },
    });

    if (!admission || admission.status !== 'ACTIVE') {
      throw new Error('Admission is not active');
    }

    const existingAllocation = await tx.bedAllocation.findFirst({
      where: {
        bedId,
        releasedAt: null,
      },
    });

    if (existingAllocation) {
      throw new Error('Bed already occupied');
    }

    // Release any previous bed
    await tx.bedAllocation.updateMany({
      where: {
        admissionId,
        releasedAt: null,
      },
      data: {
        releasedAt: new Date(),
      },
    });

    return tx.bedAllocation.create({
      data: {
        admissionId,
        bedId,
      },
    });
  });
}
