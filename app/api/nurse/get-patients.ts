// pages/api/nurse/get-patients.ts

import { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const patients = await db.patient.findMany({
      select: {
        id: true,
        first_name: true,
        last_name: true,
      },
    });
    res.status(200).json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ message: "Error fetching patients" });
  }
}
