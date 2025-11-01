// app/(protected)/admin/audit-logs/page.tsx
import { redirect } from "next/navigation";
import { getRole } from "@/utils/roles";
import { auth } from "@clerk/nextjs/server";
import AuditLogClient from "./AuditLogClient";

export default async function AuditLogPage() {
  const { userId } = await auth();
  const role = await getRole();

  // Only allow admin to access audit logs
  if (!userId) {
    redirect("/sign-in");
  }

  if (role !== "admin") {
    redirect(`/${role}`);
  }

  // TODO: Fetch audit logs from database
  // const auditLogs = await getAuditLogs();

  return <AuditLogClient />;
}