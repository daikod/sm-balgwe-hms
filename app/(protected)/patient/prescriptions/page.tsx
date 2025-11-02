// app/(protected)/patient/prescriptions/page.tsx
import { redirect } from "next/navigation";
import { getRole } from "@/utils/roles";
import { auth } from "@clerk/nextjs/server";
import PatientPrescriptionsClient from "./PatientPrescriptionsClient";

export default async function PatientPrescriptionsPage() {
  const { userId } = await auth();
  const role = await getRole();

  if (!userId) {
    redirect("/sign-in");
  }

  if (role !== "patient") {
    redirect(`/${role}`);
  }

  // TODO: Fetch patient's prescriptions from database
  // const prescriptions = await getPrescriptionsByPatientId(userId);

  return <PatientPrescriptionsClient />;
}