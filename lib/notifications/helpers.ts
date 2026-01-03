import db from "@/lib/db";

export async function countUnreadNotifications(userId: string, role: "DOCTOR" | "PATIENT") {
  return db.notification.count({
    where: {
      userId,
      userRole: role,
      isRead: false,
    },
  });
}
