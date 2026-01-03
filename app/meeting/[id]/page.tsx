import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import StreamVideoCall from "@/components/StreamVideoCall";

const MeetingPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id: meetingId } = await params;
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
    appointment.patientId === userId ||
    appointment.doctorId === userId;

  if (!isAuthorized) redirect("/unauthorized");

  const userRole =
    appointment.patientId === userId ? "patient" : "doctor";

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
