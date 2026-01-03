import AdmissionForm from '@/components/forms/AdmissionForm';
import { requireRole } from '@/lib/auth/requireRole';
import db from '@/lib/db';

interface PageProps {
  params: Promise<{ patientId?: string }>;
}

export default async function DoctorAdmitPatientPage({ params }: PageProps) {
  // Await params to satisfy Next.js 15 typing
  const { patientId } = await params;

  // Only doctors can access
  const { userId: doctorId } = await requireRole(['DOCTOR']);

  // Fetch patients assigned to this doctor who are NOT admitted
  const patientsNotAdmitted = await db.patient.findMany({
    where: {
      doctorId,
      admissions: { none: { status: 'ACTIVE' } },
    },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      date_of_birth: true,
      gender: true,
    },
  });

  if (!patientsNotAdmitted.length) {
    return <p className="text-gray-600">No patients available for admission.</p>;
  }

  // Fetch all active units with beds
  const units = await db.inpatientUnit.findMany({
    include: {
      beds: {
        where: { isActive: true },
      },
    },
  });

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h1 className="text-xl font-bold mb-4">Admit a Patient</h1>

      {patientsNotAdmitted.map((patient) => (
        <div key={patient.id} className="mb-6 border-b pb-4">
          <h2 className="text-lg font-semibold mb-2">
            {patient.first_name} {patient.last_name}
          </h2>

          <AdmissionForm
            patient={patient}
            units={units}
            currentDoctorId={doctorId}
          />
        </div>
      ))}
    </div>
  );
}
