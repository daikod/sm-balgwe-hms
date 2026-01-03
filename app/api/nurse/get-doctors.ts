// pages/api/nurse/get-doctors.ts

import { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const doctors = await db.staff.findMany({
      where: { role: 'DOCTOR' }, // Ensure you're filtering for doctors
      select: {
        id: true,
        name: true,
      },
    });
    res.status(200).json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Error fetching doctors" });
  }
}
