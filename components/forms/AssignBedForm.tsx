'use client';

import { allocateBed } from '@/app/actions/admissions/allocateBed';
import { useTransition } from 'react';

export default function AssignBedForm({
  admissionId,
  patientName,
  units,
}: {
  admissionId: number;
  patientName: string;
  units: any[];
}) {
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      await allocateBed(
        admissionId,
        Number(formData.get('bedId'))
      );
    });
  }

  return (
    <form action={onSubmit}>
      <h1>Assign Bed — {patientName}</h1>

      <div>
        <label htmlFor="bedSelect">Select Bed</label>
        <select id="bedSelect" name="bedId" required>
            {units.map((unit) => (
            <optgroup key={unit.id} label={unit.name}>
                {unit.beds.map((bed: any) => (
                <option key={bed.id} value={bed.id}>
                    Bed {bed.bedNumber}
                </option>
                ))}
            </optgroup>
            ))}
        </select>
      </div>

      <button type="button" disabled={isPending}>
        {isPending ? 'Assigning…' : 'Assign Bed'}
      </button>
    </form>
  );
}
