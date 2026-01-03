// app/(protected)/admin/inpatient/page.tsx

import db from '@/lib/db';
import InpatientAdmissionsDashboard from '@/components/InpatientAdmissionsDashboard';
import { requireRole } from '@/lib/auth/requireRole';

export default async function InpatientPage() {
  // 🔐 Admin-only inpatient overview
  await requireRole(['ADMIN']);

  const admissions = await db.admission.findMany({
    where: { status: 'ACTIVE' },
    include: {
      patient: {
        select: {
          first_name: true,
          last_name: true,
          email: true,
        },
      },
      bedAllocations: {
        select: {
          bed: {
            select: {
              id: true,
              bedNumber: true,
              unitId: true,
              isActive: true,
              unit: {
                select: { id: true, name: true },
              },
            },
          },
        },
        take: 1,
      },
    },
    orderBy: { admittedAt: 'desc' },
  });

  const mappedAdmissions = admissions.map(adm => ({
    id: adm.id,
    patientId: adm.patientId, // already string in schema
    patient: adm.patient,
    admittedAt: adm.admittedAt.toISOString(),
    provisionalDiagnosis: adm.provisionalDiagnosis,
    admittingDoctorId: adm.admittingDoctorId,
    status: adm.status,
    unit: adm.bedAllocations[0]?.bed.unit || { id: 0, name: 'Unknown' },
    bed: adm.bedAllocations[0]?.bed,
  }));

  const beds = await db.bed.findMany({
    include: { unit: true },
  });

  const bedsByUnit: Record<number, any[]> = {};
  beds.forEach(b => {
    if (!bedsByUnit[b.unitId]) bedsByUnit[b.unitId] = [];
    bedsByUnit[b.unitId].push(b);
  });

  return (
    <InpatientAdmissionsDashboard
      admissions={mappedAdmissions}
      bedsByUnit={bedsByUnit}
    />
  );
}
