import { auth } from "@clerk/nextjs/server";

// Base type for session metadata
interface SessionMetadata {
  metadata?: Record<string, any>;
}

export async function requireRole(requiredRole: string | string[]) {
  const session = await auth();

  const userId = session?.userId;
  const sessionClaims = session?.sessionClaims as SessionMetadata | undefined;

  if (!userId) {
    throw new Error("Unauthorized: No user logged in");
  }

  const role = sessionClaims?.metadata?.role as string | undefined;

  if (!role) {
    throw new Error("Unauthorized: No role assigned");
  }

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  if (!roles.includes(role)) {
    throw new Error(`Forbidden: ${role} does not have access`);
  }

  return { userId, role };
}

// Convenience guards
export const adminOnly = () => requireRole("admin");
export const doctorOnly = () => requireRole("doctor");
export const nurseOnly = () => requireRole("nurse");
export const patientOnly = () => requireRole("patient");
export const adminOrDoctor = () => requireRole(["admin", "doctor"]);
export const adminDoctorNurse = () => requireRole(["admin", "doctor", "nurse"]);
