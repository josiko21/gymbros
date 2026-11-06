import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { CheckInButton } from "@/components/CheckInButton";
import { PortalButton } from "@/components/PortalButton";
import { TodayWorkout } from "@/components/TodayWorkout";
import { getDb } from "@/lib/db";
import { isLocalDbEnabled, localDb } from "@/lib/db/local-store";
import { checkIns, trainerAssignments, workoutPlans } from "@/lib/db/schema";
import { getUserContext, hasActiveSubscription } from "@/lib/users";

export const dynamic = "force-dynamic";

export default async function AppHomePage() {
  const ctx = await getUserContext();
  if (!ctx) redirect("/sign-in");

  if (ctx.user.role === "trainer") redirect("/trainer");
  if (ctx.user.role === "admin") redirect("/admin");

  if (!hasActiveSubscription(ctx.subscription)) {
    redirect(`/checkout?plan=${ctx.subscription?.coachingMode ?? "ai"}`);
  }

  if (!ctx.profile?.onboardingComplete) {
    redirect("/app/onboarding");
  }

  const plan = isLocalDbEnabled()
    ? localDb.findLatestPlan(ctx.user.id)
    : await getDb().query.workoutPlans.findFirst({
        where: eq(workoutPlans.userId, ctx.user.id),
        orderBy: [desc(workoutPlans.createdAt)],
      });

  const recentCheckIns = isLocalDbEnabled()
    ? []
    : await getDb()
        .select()
        .from(checkIns)
        .where(eq(checkIns.userId, ctx.user.id))
        .orderBy(desc(checkIns.createdAt))
        .limit(7);

  const assignment =
    !isLocalDbEnabled() && ctx.subscription?.coachingMode === "human"
      ? await getDb().query.trainerAssignments.findFirst({
          where: eq(trainerAssignments.memberId, ctx.user.id),
        })
      : null;

  const firstName = ctx.user.name?.split(" ")[0];
  const isAi = ctx.subscription?.coachingMode === "ai";
  const healthFlags = ctx.profile?.healthFlags ?? [];

  return (
    <AppShell
      title={`Hola${firstName ? `, ${firstName}` : ""}`}
      eyebrow="Sesión de hoy"
      description="Marca ejercicios, haz check-in y habla con tu coach. Misma app, el plan que elijas."
      coachingMode={ctx.subscription?.coachingMode}
    >
      <dl className="grid grid-cols-2 gap-6 border-b border-paper/10 pb-10 lg:grid-cols-4">
        <div>
          <dt className="font-display text-4xl font-extrabold tracking-tight text-lime sm:text-5xl">
            {ctx.profile?.daysPerWeek ?? "—"}
          </dt>
          <dd className="mt-1 text-sm text-muted">días / semana</dd>
        </div>
        <div>
          <dt className="font-display text-4xl font-extrabold tracking-tight text-lime sm:text-5xl">
            {recentCheckIns.length}
          </dt>
          <dd className="mt-1 text-sm text-muted">check-ins recientes</dd>
        </div>
        <div>
          <dt className="font-display text-4xl font-extrabold tracking-tight text-lime sm:text-5xl">
            {isAi ? "IA" : "HUM"}
          </dt>
          <dd className="mt-1 text-sm text-muted">
            {isAi ? "Coach IA" : "Entrenador real"}
          </dd>
        </div>
        <div>
          <dt className="font-display text-4xl font-extrabold tracking-tight text-lime sm:text-5xl">
            {healthFlags.length || "0"}
          </dt>
          <dd className="mt-1 text-sm text-muted">flags de salud</dd>
        </div>
      </dl>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
        <TodayWorkout plan={plan ?? null} />

        <aside className="space-y-6">
          <section className="rounded-[1.75rem] border border-lime bg-ink p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lime">
              Tu camino
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight">
              {isAi ? "Coach IA" : "Entrenador real"}
            </h2>
            <p className="mt-2 text-sm capitalize text-paper/70">
              Estado · {ctx.subscription?.status}
            </p>
            {assignment ? (
              <p className="mt-2 text-sm text-paper/70">
                {assignment.status === "pending"
                  ? "Pendiente de entrenador"
                  : "Entrenador activo"}
              </p>
            ) : null}
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/app/perfil"
                className="inline-flex justify-center rounded-full bg-lime px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-lime-deep"
              >
                Mi ficha
              </Link>
              <Link
                href="/app/plan"
                className="inline-flex justify-center rounded-full border border-paper/20 px-5 py-3 text-sm font-semibold transition-colors hover:border-lime hover:text-lime"
              >
                Plan completo
              </Link>
              <Link
                href={isAi ? "/app/chat" : "/app/messages"}
                className="inline-flex justify-center rounded-full border border-paper/20 px-5 py-3 text-sm font-semibold transition-colors hover:border-lime hover:text-lime"
              >
                {isAi ? "Chat IA" : "Mensajes"}
              </Link>
              <PortalButton />
            </div>
          </section>

          {ctx.profile?.goal ? (
            <section className="rounded-[1.75rem] border border-paper/10 bg-ink-soft p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lime">
                Objetivo
              </p>
              <p className="mt-3 font-display text-2xl font-bold uppercase tracking-tight">
                {ctx.profile.goal}
              </p>
              <p className="mt-2 text-sm text-muted">
                {ctx.profile.experience}
                {ctx.profile.sessionMinutes
                  ? ` · ${ctx.profile.sessionMinutes} min`
                  : ""}
              </p>
            </section>
          ) : null}
        </aside>
      </div>

      <section className="mt-10 overflow-hidden rounded-[1.75rem] border border-paper/10 bg-paper text-ink">
        <div className="flex flex-wrap items-center justify-between gap-4 px-7 py-8 sm:px-9">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink/45">
              Sesión
            </p>
            <h2 className="mt-2 font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
              Check-in del día
            </h2>
            <p className="mt-2 max-w-md text-sm text-ink/65">
              Marca cuando termines el entrenamiento completo. Alimenta el
              seguimiento de la IA o tu coach.
            </p>
          </div>
          <CheckInButton />
        </div>
        <ul className="flex flex-wrap gap-2 border-t border-ink/10 px-7 py-5 sm:px-9">
          {recentCheckIns.length === 0 ? (
            <li className="text-sm text-ink/50">Aún no hay check-ins.</li>
          ) : (
            recentCheckIns.map((c) => (
              <li
                key={c.id}
                className="rounded-full border border-ink/15 bg-paper-muted px-3 py-1 text-sm text-ink/80"
              >
                {c.date}
              </li>
            ))
          )}
        </ul>
      </section>
    </AppShell>
  );
}
