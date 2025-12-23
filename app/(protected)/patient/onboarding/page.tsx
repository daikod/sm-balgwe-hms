import { NewPatient } from "@/components/new-patient";
import { getPatientById } from "@/utils/services/patient";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const PatientOnboarding = async () => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data } = await getPatientById(userId);

  // If patient already completed registration → dashboard
  if (data && data.first_name && data.date_of_birth) {
    redirect("/patient/dashboard");
  }

  return (
    <div className="w-full h-full flex justify-center">
      <div className="max-w-6xl w-full relative pb-10">
        <NewPatient
          data={data}
          type={data ? "update" : "create"}
        />
      </div>
    </div>
  );
};

export default PatientOnboarding;
