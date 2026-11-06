import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { HumanChat } from "@/components/HumanChat";
import { getUserContext, hasActiveSubscription } from "@/lib/users";

export default async function MessagesPage() {
  const ctx = await getUserContext();
  if (!ctx) redirect("/sign-in");
  if (!hasActiveSubscription(ctx.subscription)) {
    redirect(`/checkout?plan=${ctx.subscription?.coachingMode ?? "ai"}`);
  }
  if (ctx.subscription?.coachingMode !== "human") {
    redirect("/app/chat");
  }

  return (
    <AppShell
      title="Mensajes"
      eyebrow="Entrenador real"
      description="Conversación 1:1 con tu coach. Misma ficha, mismo plan."
      coachingMode="human"
    >
      <HumanChat />
    </AppShell>
  );
}
