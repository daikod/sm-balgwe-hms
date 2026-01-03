// utils/services/nurse.ts

import { fetcher } from "./fetcher"; // Assuming you have a fetcher utility for API calls

export const getNurseDashboardStats = async () => {
  // Example fetch call to your API (you can adjust to your backend)
  try {
    const response = await fetcher("/api/nurse/dashboard-stats");
    if (response.ok) {
      return response.json();
    }
    return {
      totalPatients: 0,
      totalInpatients: 0,
      totalAppointments: 0,
      recentAppointments: [],
    };
  } catch (error) {
    console.error("Error fetching nurse dashboard stats:", error);
    return {
      totalPatients: 0,
      totalInpatients: 0,
      totalAppointments: 0,
      recentAppointments: [],
    };
  }
};
