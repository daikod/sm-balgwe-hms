// app/(protected)/notifications/page.tsx
import { redirect } from "next/navigation";
import { getRole } from "@/utils/roles";
import { auth } from "@clerk/nextjs/server";
import NotificationsClient from "./NotificationsClient";

export default async function NotificationsPage() {
  const { userId } = await auth();
  const role = await getRole();

  if (!userId) {
    redirect("/sign-in");
  }

  // TODO: Fetch user's notifications from database
  // const notifications = await getNotificationsByUserId(userId);

  return <NotificationsClient role={role} userId={userId} />;
}