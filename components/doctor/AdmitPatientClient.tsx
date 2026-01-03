"use client";

import { useState } from "react";
import AdmissionForm from "@/components/forms/AdmissionForm";

export default function AdmitPatientClient({
  patients,
  units,
  currentDoctorId,
}: {
  patients: any[];
  units: any[];
  currentDoctorId: string;
}) {
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  if (selectedPatient) {
    return (
      <AdmissionForm
        patient={selectedPatient}
        units={units}
        currentDoctorId={currentDoctorId}
      />
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h1 className="text-xl font-bold mb-4">Select Patient to Admit</h1>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Patient</th>
            <th className="p-2 text-left">Gender</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-2">
                {p.first_name} {p.last_name}
              </td>
              <td className="p-2">{p.gender}</td>
              <td className="p-2 text-right">
                <button
                  type="button"
                  onClick={() => setSelectedPatient(p)}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  Admit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
