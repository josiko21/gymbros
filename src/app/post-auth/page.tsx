import { redirect } from "next/navigation";
import {
  ensureUser,
  hasActiveSubscription,
  homePathForRole,
  getUserContext,
} from "@/lib/users";

export const dynamic = "force-dynamic";

export default async function PostAuthPage() {
  const user = await ensureUser();
  if (!user) redirect("/sign-in");

  if (user.role === "trainer") {
    if (!user.trainerOnboardingComplete) {
      redirect("/trainer/onboarding");
    }
    redirect("/trainer");
  }

  if (user.role === "admin") {
    redirect("/admin");
  }

  const ctx = await getUserContext();
  if (!hasActiveSubscription(ctx?.subscription)) {
    redirect(`/checkout?plan=${ctx?.subscription?.coachingMode ?? "ai"}`);
  }
  if (!ctx?.profile?.onboardingComplete) {
    redirect("/app/onboarding");
  }

  redirect(homePathForRole(user.role));
}
