// pages/api/nurse/dashboard-stats.ts

import { NextApiRequest, NextApiResponse } from "next";

// Mock data for nurse stats (replace with actual logic)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Simulate fetching nurse data (replace with actual database or API calls)
  const nurseStats = {
    totalPatients: 120,  // Number of patients under the nurse's care
    totalInpatients: 30,  // Number of inpatients
    totalAppointments: 50,  // Number of total appointments
    recentAppointments: [
      {
        id: "appointment-1",
        patientName: "John Doe",
        appointmentDate: "2025-12-30T10:00:00Z",
        status: "Completed",
      },
      {
        id: "appointment-2",
        patientName: "Jane Smith",
        appointmentDate: "2025-12-30T14:00:00Z",
        status: "Pending",
      },
    ],
  };

  // Respond with the mock data
  res.status(200).json(nurseStats);
}
