'use client';

import { useTransition } from 'react';
import { recordMedicationAdministration } from '@/app/actions/clinical/recordMedicationAdministration';

interface Administration {
  id: string;
  dosageGiven: string;
  administeredAt: string;
  administeredBy: string;
}

interface Medication {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  status: string;
  administrations: Administration[];
}

interface Prescription {
  id: string;
  diagnosis: string;
  instructions: string | null;
  status: string;
  medications: Medication[];
}

interface TreatmentChartProps {
  admissionId: number;   // added admissionId
  patientId: string;
  prescriptions: Prescription[];
}

export default function TreatmentChart({
  admissionId,
  patientId,
  prescriptions,
}: TreatmentChartProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      {prescriptions.map(p => (
        <div key={p.id} className="border p-4">
          <h3 className="font-semibold">Diagnosis: {p.diagnosis}</h3>

          {p.medications.map((m) => (
            <div key={m.id} className="mt-3 border p-2">
              <div>
                {m.medicationName} — {m.dosage} ({m.frequency})
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);

                  startTransition(async () => {
                    await recordMedicationAdministration(
                      m.id,
                      patientId,
                      'current-user-id', // from Clerk
                      'NURSE',
                      String(fd.get('dosageGiven')),
                      String(fd.get('notes') || '')
                    );
                    // return nothing, so Promise<void>
                  });
                }}
              >
                <input
                  name="dosageGiven"
                  placeholder="Dose given"
                  required
                />
                <input
                  name="notes"
                  placeholder="Notes"
                />
                <button disabled={isPending}>Administer</button>
              </form>

              <ul className="text-sm mt-2">
                {m.administrations.map((a) => (
                  <li key={a.id}>
                    {a.administeredAt} — {a.dosageGiven} by {a.administeredBy}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
