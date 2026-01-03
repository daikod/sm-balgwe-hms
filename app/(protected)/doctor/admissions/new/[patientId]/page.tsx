import AdmissionForm from '@/components/forms/AdmissionForm';
import { requireRole } from '@/lib/auth/requireRole';
import db from '@/lib/db';

interface PageProps {
  params: Promise<{ patientId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdmitPatientPage({ params }: PageProps) {
  const { patientId } = await params;

  // Ensure only doctors can access
  await requireRole(['DOCTOR']);

  // Fetch patient by ID
  const patient = await db.patient.findUnique({
    where: { id: patientId },
  });

  if (!patient) {
    return <p className="text-red-600">Patient not found.</p>;
  }

  // Fetch all active inpatient units with beds
  const units = await db.inpatientUnit.findMany({
    include: {
      beds: {
        where: { isActive: true },
      },
    },
  });

  // Convert date_of_birth to Date for safety
  const safePatient = {
    ...patient,
    date_of_birth: patient.date_of_birth
      ? new Date(patient.date_of_birth)
      : null,
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h1 className="text-xl font-bold mb-4">
        Admit {patient.first_name} {patient.last_name}
      </h1>

      <AdmissionForm
        patient={safePatient}
        units={units}
        currentDoctorId="doctorId"
      />
    </div>
  );
}
