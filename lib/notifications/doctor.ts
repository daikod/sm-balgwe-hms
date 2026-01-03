import db from "@/lib/db";

export async function getDoctorInbox(doctorId: string, options?: { limit?: number; unreadOnly?: boolean }) {
  const { limit = 50, unreadOnly = false } = options || {};

  return db.notification.findMany({
    where: {
      userId: doctorId,
      userRole: "DOCTOR",
      ...(unreadOnly ? { isRead: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
