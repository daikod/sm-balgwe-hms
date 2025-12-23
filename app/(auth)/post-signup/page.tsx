import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getPatientById } from "@/utils/services/patient";

const PostSignup = async () => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data } = await getPatientById(userId);

  if (data && data.first_name && data.date_of_birth) {
    redirect("/patient/dashboard");
  }

  redirect("/patient/onboarding");
};

export default PostSignup;
