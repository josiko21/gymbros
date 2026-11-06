import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { generateObject } from "ai";
import { z } from "zod";
import { deepseekModel, getDeepSeek } from "@/lib/ai";
import { getDb } from "@/lib/db";
import { buildStarterPlan, isLocalDbEnabled, localDb } from "@/lib/db/local-store";
import { profiles, workoutPlans } from "@/lib/db/schema";
import {
  formatProfileContext,
  memberProfileSchema,
  profileUpdateFromInput,
} from "@/lib/member-profile";
import { ensureUser, getUserContext, hasActiveSubscription } from "@/lib/users";

const planSchema = z.object({
  title: z.string(),
  summary: z.string(),
  days: z.array(
    z.object({
      day: z.string(),
      focus: z.string(),
      exercises: z.array(
        z.object({
          name: z.string(),
          sets: z.string(),
          reps: z.string(),
          notes: z.string().optional(),
        }),
      ),
    }),
  ),
});

function hasDeepSeek() {
  return Boolean(process.env.DEEPSEEK_API_KEY?.trim());
}

export async function POST(request: Request) {
  try {
    const user = await ensureUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ctx = await getUserContext();
    if (!ctx || !hasActiveSubscription(ctx.subscription)) {
      return NextResponse.json(
        { error: "Necesitas una suscripción activa" },
        { status: 402 },
      );
    }

    const parsed = memberProfileSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const update = profileUpdateFromInput(parsed.data);
    const isFirstOnboarding = !ctx.profile?.onboardingComplete;

    if (isLocalDbEnabled()) {
      localDb.updateProfile(user.id, {
        ...update,
        onboardingComplete: true,
      });
    } else {
      const db = getDb();
      await db
        .update(profiles)
        .set({
          ...update,
          onboardingComplete: true,
        })
        .where(eq(profiles.userId, user.id));
    }

    if (isFirstOnboarding && ctx.subscription?.coachingMode === "ai") {
      const profileForPrompt = {
        ...(ctx.profile ?? ({} as NonNullable<typeof ctx.profile>)),
        ...update,
      };

      let planObject = buildStarterPlan(parsed.data.daysPerWeek);

      if (hasDeepSeek()) {
        try {
          const deepseek = getDeepSeek();
          const { object } = await generateObject({
            model: deepseek(deepseekModel),
            schema: planSchema,
            prompt: `Eres un entrenador personal experto. Crea un plan semanal seguro en español.

PERFIL DEL ALUMNO:
${formatProfileContext(profileForPrompt)}

REGLAS DE SEGURIDAD (obligatorias):
- Prioriza lesiones, dolor, contraindicaciones y condiciones de salud.
- No propongas ejercicios contraindicados. Sustituye por alternativas seguras.
- Si hay flags de salud graves o sin alta médica, sé conservador (bajo impacto, técnica, movilidad).
- No des consejo médico ni diagnósticos.
- Incluye exactamente ${parsed.data.daysPerWeek} días de entrenamiento con ejercicios concretos (series y reps).
- Adapta a material y minutos por sesión si están indicados.`,
          });
          planObject = object;
        } catch {
          // fallback al plan starter
        }
      }

      const weekStart = new Date().toISOString().slice(0, 10);
      if (isLocalDbEnabled()) {
        localDb.insertPlan({
          userId: user.id,
          weekStart,
          title: planObject.title,
          summary: planObject.summary,
          days: planObject.days,
        });
      } else {
        const db = getDb();
        await db.insert(workoutPlans).values({
          userId: user.id,
          weekStart,
          title: planObject.title,
          summary: planObject.summary,
          days: planObject.days,
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Onboarding failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isLocalDbEnabled()) {
      return NextResponse.json({
        profile: ctx.profile,
        subscription: ctx.subscription,
        plan: localDb.findLatestPlan(ctx.user.id),
      });
    }

    const db = getDb();
    const plan = await db.query.workoutPlans.findFirst({
      where: eq(workoutPlans.userId, ctx.user.id),
      orderBy: [desc(workoutPlans.createdAt)],
    });

    return NextResponse.json({
      profile: ctx.profile,
      subscription: ctx.subscription,
      plan,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
