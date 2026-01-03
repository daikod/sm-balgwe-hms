import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Prisma Role enum values
 */
export type Role =
  | "ADMIN"
  | "DOCTOR"
  | "NURSE"
  | "LAB_TECHNICIAN"
  | "PATIENT"
  | "CASHIER";

interface SessionPublicMetadata {
  role?: string; // Clerk stores lowercase strings like "doctor"
}

export async function requireRole(allowedRoles: Role[]) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const publicMetadata =
    sessionClaims?.publicMetadata as SessionPublicMetadata | undefined;

  /**
   * Normalize Clerk role -> Prisma enum casing
   * "doctor" -> "DOCTOR"
   */
  const normalizedRole = publicMetadata?.role
    ? (publicMetadata.role.toUpperCase() as Role)
    : undefined;

  if (!normalizedRole || !allowedRoles.includes(normalizedRole)) {
    redirect("/unauthorized");
  }

  return {
    userId,
    role: normalizedRole, // always enum-safe
  };
}
