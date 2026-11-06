import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/app(.*)",
  "/trainer(.*)",
  "/admin(.*)",
  "/checkout(.*)",
  "/post-auth(.*)",
  "/api/checkout(.*)",
  "/api/portal(.*)",
  "/api/chat(.*)",
  "/api/plan(.*)",
  "/api/onboarding(.*)",
  "/api/check-in(.*)",
  "/api/messages(.*)",
  "/api/assignments(.*)",
  "/api/exercises(.*)",
  "/api/trainer(.*)",
]);

const clerkProxy = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export default process.env.CLERK_SECRET_KEY
  ? clerkProxy
  : function proxy() {
      return NextResponse.next();
    };

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
