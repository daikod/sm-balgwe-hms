'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAdmission } from '@/app/actions/admissions/createAdmission';

interface AdmissionFormProps {
  units: {
    id: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    beds: {
      id: number;
      unitId: number;
      bedNumber: string;
      isActive: boolean;
    }[];
  }[];
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: Date | string | null;
    gender: string;
  };
  currentDoctorId: string;
}

export default function AdmissionForm({ units, patient }: AdmissionFormProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedBed, setSelectedBed] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function onSubmit(formData: FormData) {
    setError(null); // reset previous errors

    startTransition(async () => {
      try {
        await createAdmission({
          patientId: patient.id,
          chiefComplaint: String(formData.get('chiefComplaint')),
          provisionalDiagnosis: String(formData.get('provisionalDiagnosis')),
          initialTherapyPlan: String(formData.get('initialTherapyPlan') || ''),
          admittingDoctorId: String(formData.get('admittingDoctorId')),
          bedId: selectedBed,
        });

        router.push('/doctor/admissions');
      } catch (err: any) {
        // Display server error inline
        setError(err?.message || 'Failed to admit patient.');
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-semibold">
        Admit {patient.first_name} {patient.last_name}
      </h1>

      {error && <p className="text-red-600 font-medium">{error}</p>}

      <div>
        <label htmlFor="chiefComplaint" className="block font-medium mb-1">
          Chief Complaint
        </label>
        <textarea
          id="chiefComplaint"
          name="chiefComplaint"
          required
          className="w-full border rounded p-2"
          placeholder="Enter chief complaint"
        />
      </div>

      <div>
        <label htmlFor="provisionalDiagnosis" className="block font-medium mb-1">
          Provisional Diagnosis
        </label>
        <textarea
          id="provisionalDiagnosis"
          name="provisionalDiagnosis"
          required
          className="w-full border rounded p-2"
          placeholder="Enter provisional diagnosis"
        />
      </div>

      <div>
        <label htmlFor="initialTherapyPlan" className="block font-medium mb-1">
          Initial Therapy Plan
        </label>
        <textarea
          id="initialTherapyPlan"
          name="initialTherapyPlan"
          className="w-full border rounded p-2"
          placeholder="Enter initial therapy plan"
        />
      </div>

      <div>
        <label htmlFor="bedSelect" className="block font-medium mb-1">
          Assign Bed
        </label>
        <select
          id="bedSelect"
          className="w-full border rounded p-2"
          onChange={(e) =>
            setSelectedBed(
              e.target.value ? Number(e.target.value) : undefined
            )
          }
          defaultValue=""
        >
          <option value="">No bed assigned</option>

          {units.map((unit) => (
            <optgroup key={unit.id} label={unit.name}>
              {unit.beds.map((bed) => (
                <option key={bed.id} value={bed.id}>
                  Bed {bed.bedNumber}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {isPending ? 'Admitting…' : 'Admit Patient'}
      </button>
    </form>
  );
}
