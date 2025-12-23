import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { routeAccess } from "./lib/routes";

const matchers = Object.keys(routeAccess).map((route) => ({
  matcher: createRouteMatcher([route]),
  allowedRoles: routeAccess[route] || ["patient"],
}));

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const { pathname, origin } = new URL(req.url);

  // Allow unauthenticated access
  if (!userId) return NextResponse.next();

  const role = sessionClaims?.metadata?.role ?? "patient";

  // 🚨 NEVER redirect these routes
  if (
    pathname.startsWith("/patient/onboarding") ||
    pathname.startsWith("/post-signup") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up")
  ) {
    return NextResponse.next();
  }

  const matchingRoute = matchers.find(({ matcher }) => matcher(req));

  if (matchingRoute && !matchingRoute.allowedRoles.includes(role)) {
    const redirectMap: Record<string, string> = {
      patient: "/patient/dashboard",
      doctor: "/doctor",
      admin: "/admin",
    };

    return NextResponse.redirect(
      new URL(redirectMap[role] ?? "/sign-in", origin)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|svg|ico|woff2?|ttf)).*)",
    "/(api|trpc)(.*)",
  ],
};
