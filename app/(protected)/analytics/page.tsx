// app/(protected)/analytics/page.tsx
import { redirect } from "next/navigation";
import { getRole } from "@/utils/roles";
import { auth } from "@clerk/nextjs/server";
import AnalyticsReportsClient from "./AnalyticsReportsClient";

export default async function AnalyticsPage() {
  const { userId } = await auth();
  const role = await getRole();

  // Only allow admin and doctor to access analytics
  if (!userId) {
    redirect("/sign-in");
  }

  if (role !== "admin" && role !== "doctor") {
    redirect(`/${role}`);
  }

  return <AnalyticsReportsClient role={role} />;
}