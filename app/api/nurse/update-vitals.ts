// pages/api/nurse/update-vitals.ts

import { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { patientId, vitals, doctorId } = req.body;

  try {
    // Find the patient and update vitals
    const updatedPatient = await db.patient.update({
      where: { id: patientId },
      data: {
        vitals: { // Update the vitals field (modify this according to your schema)
          temperature: vitals.temperature,
          bloodPressure: vitals.bloodPressure,
          heartRate: vitals.heartRate,
          respiratoryRate: vitals.respiratoryRate,
        },
        doctorId: doctorId, // Attach the doctor to the patient
      },
    });

    // Notify doctor or handle logic here (could be through notifications)
    // For now, just log the update (add your email or notification service)
    console.log(`Vitals updated for patient ${patientId}. Notifying doctor ${doctorId}.`);

    res.status(200).json({ message: "Vitals updated successfully", patient: updatedPatient });
  } catch (error) {
    console.error("Error updating patient vitals:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
