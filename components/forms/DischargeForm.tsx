'use client';

import React, { useState } from 'react';
import { dischargePatient } from '@/app/actions/clinical/dischargePatient';
import { Admission } from '@prisma/client';

interface DischargeFormProps {
  admissionId: number;
  patientName: string;
}

export default function DischargeForm({ admissionId }: DischargeFormProps) {
  const [dischargeNotes, setDischargeNotes] = useState('');
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDischarge = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await dischargePatient({
        admissionId,
        dischargedBy: 'SYSTEM', // replace with current clerk user ID from session
        dischargeSummary: dischargeNotes,
      });

      setSummary(result);
    } catch (err: any) {
      setError(err.message || 'Failed to discharge patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Complete Patient Discharge</h2>

      <textarea
        className="w-full border rounded p-2 mb-4"
        placeholder="Enter discharge notes..."
        value={dischargeNotes}
        onChange={(e) => setDischargeNotes(e.target.value)}
        rows={4}
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        onClick={handleDischarge}
        disabled={loading}
      >
        {loading ? 'Discharging...' : 'Discharge Patient'}
      </button>

      {error && <p className="text-red-600 mt-2">{error}</p>}

      {summary && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Discharge Summary Preview</h3>

          <p><strong>Patient:</strong> {summary.patientName}</p>
          <p><strong>Discharged At:</strong> {new Date(summary.dischargedAt).toLocaleString()}</p>

          {summary.vitals?.length > 0 && (
            <div className="mt-2">
              <h4 className="font-semibold">Vitals</h4>
              <table className="border-collapse border w-full text-sm">
                <thead>
                  <tr>
                    <th className="border p-1">Temp (°C)</th>
                    <th className="border p-1">Systolic</th>
                    <th className="border p-1">Diastolic</th>
                    <th className="border p-1">HR</th>
                    <th className="border p-1">Resp Rate</th>
                    <th className="border p-1">O2 Sat</th>
                    <th className="border p-1">Weight</th>
                    <th className="border p-1">Height</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.vitals.map((v: any) => (
                    <tr key={v.id}>
                      <td className="border p-1">{v.body_temperature}</td>
                      <td className="border p-1">{v.systolic}</td>
                      <td className="border p-1">{v.diastolic}</td>
                      <td className="border p-1">{v.heartRate}</td>
                      <td className="border p-1">{v.respiratory_rate || '-'}</td>
                      <td className="border p-1">{v.oxygen_saturation || '-'}</td>
                      <td className="border p-1">{v.weight}</td>
                      <td className="border p-1">{v.height}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {summary.diagnoses?.length > 0 && (
            <div className="mt-2">
              <h4 className="font-semibold">Diagnoses</h4>
              <ul className="list-disc list-inside">
                {summary.diagnoses.map((d: any) => (
                  <li key={d.id}>{d.diagnosis} {d.notes ? `- ${d.notes}` : ''}</li>
                ))}
              </ul>
            </div>
          )}

          {summary.prescriptions?.length > 0 && (
            <div className="mt-2">
              <h4 className="font-semibold">Medications</h4>
              <ul className="list-disc list-inside">
                {summary.prescriptions.map((p: any) => (
                  <li key={p.id}>
                    <strong>Diagnosis: {p.diagnosis || 'N/A'}</strong>
                    <ul className="list-disc list-inside ml-4">
                      {p.medications.map((m: any) => (
                        <li key={m.id}>
                          {m.medicationName} - {m.dosage} ({m.frequency}) 
                          {m.administrations.length ? ` - Administered: ${m.administrations.length} times` : ''}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {summary.dischargeNotes && (
            <div className="mt-2">
              <h4 className="font-semibold">Discharge Notes</h4>
              <p>{summary.dischargeNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
