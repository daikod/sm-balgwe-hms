// app/(protected)/doctor/administer-medications/page.tsx
import { redirect } from "next/navigation";
import { getRole } from "@/utils/roles";
import { auth } from "@clerk/nextjs/server";
import AdministerMedicationsClient from "./AdministerMedicationsClient";

export default async function AdministerMedicationsPage() {
  const { userId } = await auth();
  const role = await getRole();

  if (!userId) {
    redirect("/sign-in");
  }

  if (role !== "doctor" && role !== "nurse" && role !== "admin") {
    redirect(`/${role}`);
  }

  // TODO: Fetch pending medications and patients
  // const pendingMedications = await getPendingMedications();

  return <AdministerMedicationsClient role={role} />;
}