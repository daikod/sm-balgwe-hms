// app/(protected)/admin/inpatient/actions/assignBed.ts
import db from "@/lib/db";

interface AssignBedParams {
  admissionId: number;
  bedId: number;
}

export async function assignBed({ admissionId, bedId }: AssignBedParams) {
  if (!admissionId || !bedId) throw new Error("Admission ID and Bed ID are required.");

  const bed = await db.bed.findUnique({ where: { id: bedId } });
  if (!bed || !bed.isActive) throw new Error("Selected bed is not available.");

  const existingAllocation = await db.bedAllocation.findFirst({
    where: { bedId, releasedAt: null },
  });
  if (existingAllocation) throw new Error("This bed is already occupied.");

  const currentAllocation = await db.bedAllocation.findFirst({
    where: { admissionId, releasedAt: null },
  });

  if (currentAllocation) {
    await db.bedAllocation.update({
      where: { id: currentAllocation.id },
      data: { releasedAt: new Date() },
    });
  }

  const allocation = await db.bedAllocation.create({
    data: { admissionId, bedId, assignedAt: new Date() },
  });

  return allocation;
}
