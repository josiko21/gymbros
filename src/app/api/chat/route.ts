import { desc, eq } from "drizzle-orm";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { deepseekModel, getDeepSeek } from "@/lib/ai";
import { getDb } from "@/lib/db";
import { messages, workoutPlans } from "@/lib/db/schema";
import { formatProfileContext } from "@/lib/member-profile";
import { getUserContext, hasActiveSubscription } from "@/lib/users";

export async function POST(request: Request) {
  const ctx = await getUserContext();
  if (!ctx?.user) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!hasActiveSubscription(ctx.subscription)) {
    return new Response("Subscription required", { status: 402 });
  }
  if (ctx.subscription?.coachingMode !== "ai") {
    return new Response("Chat IA solo disponible en el plan Coach IA", {
      status: 403,
    });
  }

  const body = (await request.json()) as { messages: UIMessage[] };
  const db = getDb();
  const plan = await db.query.workoutPlans.findFirst({
    where: eq(workoutPlans.userId, ctx.user.id),
    orderBy: [desc(workoutPlans.createdAt)],
  });

  const lastUser = [...body.messages].reverse().find((m) => m.role === "user");
  if (lastUser) {
    const text = lastUser.parts
      ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("\n");
    if (text) {
      await db.insert(messages).values({
        userId: ctx.user.id,
        sender: "user",
        content: text,
      });
    }
  }

  const deepseek = getDeepSeek();
  const result = streamText({
    model: deepseek(deepseekModel),
    system: `Eres el coach IA de Gymbros. Responde en español, claro y accionable.

PERFIL DEL ALUMNO:
${formatProfileContext(ctx.profile)}

Plan actual: ${plan ? `${plan.title} — ${plan.summary}` : "aún no hay plan"}.

REGLAS:
- Respeta siempre lesiones, dolor, contraindicaciones y condiciones de salud.
- No des consejo médico ni diagnósticos. Si hay dolor agudo o lesión grave, recomienda profesional de salud.
- Propón alternativas seguras si el alumno pide algo contraindicado.`,
    messages: await convertToModelMessages(body.messages),
    onFinish: async ({ text }) => {
      if (!text) return;
      await db.insert(messages).values({
        userId: ctx.user.id,
        sender: "ai",
        content: text,
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
