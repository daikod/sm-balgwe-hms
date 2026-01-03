'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'; // Adjust as per your UI library
import { Select } from '@/components/ui/select'; // Adjust based on your UI library
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const NursePatientManagement = () => {
  const [patients, setPatients] = useState<any[]>([]); // List of patients
  const [doctors, setDoctors] = useState<any[]>([]); // List of doctors
  const [selectedPatient, setSelectedPatient] = useState<string>(''); // Selected patient
  const [selectedDoctor, setSelectedDoctor] = useState<string>(''); // Selected doctor
  const [vitals, setVitals] = useState<any>({
    temperature: '',
    bloodPressure: '',
    heartRate: '',
    respiratoryRate: '',
  });

  // Fetch patients and doctors when the page loads
  useEffect(() => {
    const fetchPatientsAndDoctors = async () => {
      try {
        const patientResponse = await fetch('/api/nurse/get-patients');
        const doctorResponse = await fetch('/api/nurse/get-doctors');
        
        const patientsData = await patientResponse.json();
        const doctorsData = await doctorResponse.json();

        setPatients(patientsData);
        setDoctors(doctorsData);
      } catch (error) {
        console.error("Error fetching patients or doctors:", error);
      }
    };

    fetchPatientsAndDoctors();
  }, []);

  // Handle the vitals form submission
  const handleVitalsSubmit = async () => {
    if (!selectedPatient || !selectedDoctor) {
      toast.error("Please select a patient and a doctor.");
      return;
    }

    try {
      const response = await fetch('/api/nurse/update-vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: selectedPatient,
          vitals,
          doctorId: selectedDoctor,
        }),
      });

      const data = await response.json();

      if (data.message === "Vitals updated successfully") {
        toast.success("Vitals updated and doctor notified.");
      } else {
        toast.error("Error updating vitals.");
      }
    } catch (error) {
      console.error("Error submitting vitals:", error);
      toast.error("Error submitting vitals.");
    }
  };

  return (
    <div className="py-6 px-3 flex flex-col gap-6">
      <div className="bg-white rounded-xl p-4 mb-8">
        <h1 className="text-lg font-semibold">Nurse Patient Management</h1>
        <div className="space-y-6">
          <div>
            <Label htmlFor="patient-select">Select Patient</Label>
            <Select
              value={selectedPatient}
              onValueChange={(e: any) => setSelectedPatient(e.target.value)}
            >
              <option value="">Select a patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.firstName} {patient.lastName}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="doctor-select">Select Doctor</Label>
            <Select
              value={selectedDoctor}
              onValueChange={(e: any) => setSelectedDoctor(e.target.value)}
            >
              <option value="">Select a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.firstName} {doctor.lastName}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="temperature">Temperature (°C)</Label>
            <Input
              id="temperature"
              type="number"
              value={vitals.temperature}
              onChange={(e: any) =>
                setVitals({ ...vitals, temperature: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="bloodPressure">Blood Pressure</Label>
            <Input
              id="bloodPressure"
              type="text"
              value={vitals.bloodPressure}
              onChange={(e: any) =>
                setVitals({ ...vitals, bloodPressure: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="heartRate">Heart Rate (BPM)</Label>
            <Input
              id="heartRate"
              type="number"
              value={vitals.heartRate}
              onChange={(e: any) =>
                setVitals({ ...vitals, heartRate: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="respiratoryRate">Respiratory Rate</Label>
            <Input
              id="respiratoryRate"
              type="number"
              value={vitals.respiratoryRate}
              onChange={(e: any) =>
                setVitals({ ...vitals, respiratoryRate: e.target.value })
              }
            />
          </div>

          <Button onClick={handleVitalsSubmit} className="mt-4">
            Submit Vitals
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NursePatientManagement;
