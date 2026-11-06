import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AiChat } from "@/components/AiChat";
import { getUserContext, hasActiveSubscription } from "@/lib/users";

export default async function ChatPage() {
  const ctx = await getUserContext();
  if (!ctx) redirect("/sign-in");
  if (!hasActiveSubscription(ctx.subscription)) {
    redirect(`/checkout?plan=${ctx.subscription?.coachingMode ?? "ai"}`);
  }
  if (ctx.subscription?.coachingMode !== "ai") {
    redirect("/app/messages");
  }

  return (
    <AppShell
      title="Chat IA"
      eyebrow="Coach DeepSeek"
      description="Dudas de técnica, sustituciones y ajustes. Respeta tu ficha de salud."
      coachingMode="ai"
    >
      <AiChat />
    </AppShell>
  );
}
