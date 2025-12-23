import AppointmentQuickLinksClient from "@/components/appointment/appointment-quick-links-client";
import { checkRole } from "@/utils/roles";

interface Props {
  staffId: string;
}

const AppointmentQuickLinks = async ({ staffId }: Props) => {
  // Server-only logic
  const isPatient = await checkRole("PATIENT");

  // Pass result to Client Component
  return <AppointmentQuickLinksClient staffId={staffId} isPatient={isPatient} />;
};

export default AppointmentQuickLinks;
