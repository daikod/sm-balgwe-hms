'use client';

import { useTransition } from 'react';
import { recordVitalSigns } from '@/app/actions/clinical/recordVitalSigns';

export default function RecordVitalsForm({
  medicalId,
  patientId,
  patientName,
  vitals,
}: {
  medicalId: number;
  patientId: string;
  patientName: string;
  vitals: any[];
}) {
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      await recordVitalSigns({
        medicalId,
        patientId,

        body_temperature: Number(formData.get('body_temperature')),
        systolic: Number(formData.get('systolic')),
        diastolic: Number(formData.get('diastolic')),
        heartRate: String(formData.get('heartRate')),

        respiratory_rate: Number(formData.get('respiratory_rate') || undefined),
        oxygen_saturation: Number(formData.get('oxygen_saturation') || undefined),
        weight: Number(formData.get('weight')),
        height: Number(formData.get('height')),
      });
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">
        Vital Signs — {patientName}
      </h1>

      <form action={onSubmit} className="grid grid-cols-2 gap-4">
        <input name="body_temperature" placeholder="Temp (°C)" required />
        <input name="heartRate" placeholder="Heart Rate" required />
        <input name="systolic" placeholder="Systolic BP" required />
        <input name="diastolic" placeholder="Diastolic BP" required />
        <input name="respiratory_rate" placeholder="Respiratory Rate" />
        <input name="oxygen_saturation" placeholder="SpO₂ (%)" />
        <input name="weight" placeholder="Weight (kg)" required />
        <input name="height" placeholder="Height (cm)" required />

        <button disabled={isPending} className="col-span-2">
          {isPending ? 'Saving…' : 'Record Vitals'}
        </button>
      </form>

      <section>
        <h2 className="font-medium">Recent Vitals</h2>
        {vitals.map(v => (
          <div key={v.id} className="text-sm">
            {v.created_at} — HR {v.heartRate}, BP {v.systolic}/{v.diastolic}
          </div>
        ))}
      </section>
    </div>
  );
}
