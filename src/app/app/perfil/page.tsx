import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { MemberProfileEditor } from "@/components/MemberProfileEditor";
import { getUserContext, hasActiveSubscription } from "@/lib/users";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const ctx = await getUserContext();
  if (!ctx) redirect("/sign-in");
  if (ctx.user.role === "trainer") redirect("/trainer");
  if (ctx.user.role === "admin") redirect("/admin");
  if (!hasActiveSubscription(ctx.subscription)) {
    redirect(`/checkout?plan=${ctx.subscription?.coachingMode ?? "ai"}`);
  }
  if (!ctx.profile?.onboardingComplete) redirect("/app/onboarding");

  return (
    <AppShell
      title="Mi ficha"
      eyebrow="Datos del alumno"
      description="Entrenamiento, salud y estilo de vida. La IA y tu coach leen esta estructura."
      coachingMode={ctx.subscription?.coachingMode}
    >
      <MemberProfileEditor initial={ctx.profile} />
    </AppShell>
  );
}
