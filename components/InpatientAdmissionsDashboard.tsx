"use client";

import React, { useState } from "react";
import DischargeForm from "@/components/forms/DischargeForm";
import { assignBed } from "@/app/(protected)/admin/inpatient/actions/assignBed";

interface AdmissionWithPatient {
  id: number;
  patientId: string;
  patient: { first_name: string; last_name: string; email: string };
  admittingDoctor?: string | null;
  provisionalDiagnosis: string;
  admittedAt: string;
  status: string;
  unit: { id: number; name: string };
  bed?: { id: number; bedNumber: string };
}

interface Bed {
  id: number;
  bedNumber: string;
  isActive: boolean;
}

interface InpatientAdmissionsDashboardProps {
  admissions: AdmissionWithPatient[];
  bedsByUnit: Record<number, Bed[]>;
}

export default function InpatientAdmissionsDashboard({
  admissions,
  bedsByUnit,
}: InpatientAdmissionsDashboardProps) {
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<number | null>(null);
  const [bedAssignments, setBedAssignments] = useState<Record<number, number>>(
    Object.fromEntries(admissions.map((a) => [a.id, a.bed?.id || 0]))
  );

  const units = Array.from(new Set(admissions.map((a) => a.unit.name)));

  const handleDischargeClick = (admissionId: number) => setSelectedAdmissionId(admissionId);
  const handleCloseForm = () => setSelectedAdmissionId(null);

  const filteredAdmissions = selectedUnit
    ? admissions.filter((a) => a.unit.name === selectedUnit)
    : admissions;

  const handleBedChange = async (admissionId: number, bedId: number) => {
    try {
      const allocation = await assignBed({ admissionId, bedId });
      setBedAssignments((prev) => ({ ...prev, [admissionId]: bedId }));
      alert(`Bed assigned successfully: ${allocation.bedId}`);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to assign bed.");
    }
  };

  const selectedAdmission = selectedAdmissionId
    ? admissions.find((a) => a.id === selectedAdmissionId)
    : null;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Inpatient Admissions with Bed Assignment</h1>

      {/* Unit Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          className={`px-3 py-1 rounded ${selectedUnit === null ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => setSelectedUnit(null)}
        >
          All Units
        </button>
        {units.map((unit) => (
          <button
            key={unit}
            className={`px-3 py-1 rounded ${selectedUnit === unit ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => setSelectedUnit(unit)}
          >
            {unit}
          </button>
        ))}
      </div>

      {filteredAdmissions.length === 0 && <p>No admissions in this unit.</p>}

      <table className="w-full border-collapse border text-sm">
        <thead>
          <tr>
            <th className="border p-2">Patient Name</th>
            <th className="border p-2">Admission Date</th>
            <th className="border p-2">Unit</th>
            <th className="border p-2">Bed</th>
            <th className="border p-2">Provisional Diagnosis</th>
            <th className="border p-2">Admitting Doctor</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAdmissions.map((admission) => {
            const unitBeds = bedsByUnit[admission.unit.id] || [];
            return (
              <tr key={admission.id}>
                <td className="border p-2">{admission.patient.first_name} {admission.patient.last_name}</td>
                <td className="border p-2">{new Date(admission.admittedAt).toLocaleString()}</td>
                <td className="border p-2">{admission.unit.name}</td>
                <td className="border p-2">
                  <label htmlFor={`bed-select-${admission.id}`} className="sr-only">
                    Select bed for {admission.patient.first_name} {admission.patient.last_name}
                  </label>
                  <select
                    id={`bed-select-${admission.id}`}
                    value={bedAssignments[admission.id] || 0}
                    onChange={(e) => handleBedChange(admission.id, Number(e.target.value))}
                    className="border rounded p-1"
                  >
                    <option value={0}>Unassigned</option>
                    {unitBeds.map((bed) => (
                      <option key={bed.id} value={bed.id} disabled={!bed.isActive}>
                        {bed.bedNumber} {bed.isActive ? "" : "(Occupied)"}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border p-2">{admission.provisionalDiagnosis}</td>
                <td className="border p-2">{admission.admittingDoctor || "N/A"}</td>
                <td className="border p-2">
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    onClick={() => handleDischargeClick(admission.id)}
                  >
                    Discharge
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {selectedAdmission && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <DischargeForm
            admissionId={selectedAdmission.id}
            patientName={`${selectedAdmission.patient.first_name} ${selectedAdmission.patient.last_name}`}
          />
          <button className="mt-2 text-gray-600 underline" onClick={handleCloseForm}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
