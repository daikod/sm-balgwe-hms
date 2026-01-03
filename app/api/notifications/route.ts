// api/notifications/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import db from "@/lib/db";

async function fetchNotifications() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json([], { status: 200 });

    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // Ensure always return an array
    return NextResponse.json(notifications ?? []);
  } catch (err) {
    console.error("Notifications API failed:", err);
    return NextResponse.json([], { status: 200 });
  }
}

// Support GET and POST (POST required for Navbar)
export async function GET() {
  return fetchNotifications();
}

export async function POST() {
  return fetchNotifications();
}
