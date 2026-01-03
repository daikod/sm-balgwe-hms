import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { routeAccess } from "./lib/routes";

type AppRole = "admin" | "doctor" | "nurse" | "patient";

const matchers = Object.keys(routeAccess).map((route) => ({
  matcher: createRouteMatcher([route]),
  allowedRoles: routeAccess[route] ?? ["patient"],
}));

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const { pathname, origin } = new URL(req.url);

  if (!userId) return NextResponse.next();

  const role: AppRole =
    (sessionClaims?.metadata?.role as AppRole) ?? "patient";

  // Allow onboarding/auth routes
  if (
    pathname.startsWith("/patient/onboarding") ||
    pathname.startsWith("/post-signup") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up")
  ) {
    return NextResponse.next();
  }

  // Root redirect
  if (pathname === "/") {
    const redirectMap: Record<AppRole, string> = {
      patient: "/patient/dashboard",
      doctor: "/doctor",
      admin: "/admin/dashboard",
      nurse: "/nurse",
    };

    return NextResponse.redirect(new URL(redirectMap[role], origin));
  }

  const matchingRoute = matchers.find(({ matcher }) => matcher(req));

  if (matchingRoute && !matchingRoute.allowedRoles.includes(role)) {
    const redirectMap: Record<AppRole, string> = {
      patient: "/patient/dashboard",
      doctor: "/doctor",
      admin: "/admin/dashboard",
      nurse: "/nurse",
    };

    return NextResponse.redirect(new URL(redirectMap[role], origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|svg|ico|woff2?|ttf)).*)",
    "/(api|trpc)(.*)",
    "/(protected|admin|doctor|patient|nurse)(.*)",
  ],
};
