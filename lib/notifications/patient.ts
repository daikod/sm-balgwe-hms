import db from "@/lib/db";

export async function getPatientInbox(patientId: string, options?: { limit?: number; unreadOnly?: boolean }) {
  const { limit = 50, unreadOnly = false } = options || {};

  return db.notification.findMany({
    where: {
      userId: patientId,
      userRole: "PATIENT",
      ...(unreadOnly ? { isRead: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
