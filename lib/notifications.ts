import db from "./db";
import { Role } from "@prisma/client";

/**
 * Get all notifications for a doctor, most recent first
 */
export async function getDoctorInbox(doctorId: string) {
  return db.notification.findMany({
    where: { userId: doctorId, userRole: Role.DOCTOR },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get all notifications for a patient, most recent first
 */
export async function getPatientInbox(patientId: string) {
  return db.notification.findMany({
    where: { userId: patientId, userRole: Role.PATIENT },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get count of unread notifications for a user
 */
export async function getUnreadCount(userId: string, role: Role) {
  return db.notification.count({
    where: { userId, userRole: role, isRead: false },
  });
}
