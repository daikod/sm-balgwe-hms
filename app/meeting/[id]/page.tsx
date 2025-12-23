import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import StreamVideoCall from "@/components/StreamVideoCall";

type PageProps = {
  params: Promise<{ id: string }>;
};

const MeetingPage = async ({ params }: PageProps) => {
  const { id: meetingId } = await params; // ✅ await params
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const appointment = await db.appointment.findFirst({
    where: { roomID: meetingId },
    include: {
      patient: true,
      doctor: true,
    },
  });

  if (!appointment) redirect("/dashboard");

  const isAuthorized =
    appointment.patient_id === userId ||
    appointment.doctor_id === userId;

  if (!isAuthorized) redirect("/unauthorized");

  const userRole =
    appointment.patient_id === userId ? "patient" : "doctor";

  return (
    <div className="h-screen">
      <StreamVideoCall
        meetingId={meetingId}
        userId={userId}
        userRole={userRole}
        appointmentData={appointment}
      />
    </div>
  );
};

export default MeetingPage;
