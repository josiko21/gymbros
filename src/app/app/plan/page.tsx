import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getDb } from "@/lib/db";
import { isLocalDbEnabled, localDb } from "@/lib/db/local-store";
import { workoutPlans } from "@/lib/db/schema";
import { getUserContext, hasActiveSubscription } from "@/lib/users";

export default async function PlanPage() {
  const ctx = await getUserContext();
  if (!ctx) redirect("/sign-in");
  if (!hasActiveSubscription(ctx.subscription)) {
    redirect(`/checkout?plan=${ctx.subscription?.coachingMode ?? "ai"}`);
  }

  const plan = isLocalDbEnabled()
    ? localDb.findLatestPlan(ctx.user.id)
    : await getDb().query.workoutPlans.findFirst({
        where: eq(workoutPlans.userId, ctx.user.id),
        orderBy: [desc(workoutPlans.createdAt)],
      });

  return (
    <AppShell
      title="Tu plan"
      eyebrow="Semana actual"
      description="Estructura clara por días. Entra en Hoy para marcar ejercicios."
      coachingMode={ctx.subscription?.coachingMode}
    >
      {!plan ? (
        <div className="rounded-[1.75rem] border border-paper/10 bg-ink-soft p-8">
          <p className="text-paper/70">
            Todavía no hay un plan generado. Completa el onboarding o habla con
            tu entrenador.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="rounded-[1.75rem] border border-lime bg-ink p-7 sm:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime">
              Semana de {plan.weekStart}
            </p>
            <h2 className="mt-3 font-display text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">
              {plan.title}
            </h2>
            <p className="mt-3 max-w-2xl text-paper/70">{plan.summary}</p>
          </div>

          <ol className="grid gap-5 md:grid-cols-2">
            {plan.days.map((day, index) => (
              <li
                key={`${day.day}-${day.focus}`}
                className="rounded-[1.75rem] border border-paper/10 bg-ink-soft p-7"
              >
                <span className="font-display text-4xl font-extrabold text-lime">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  {day.day}
                </p>
                <h3 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight">
                  {day.focus}
                </h3>
                <ul className="mt-5 divide-y divide-paper/10 border-t border-paper/10">
                  {day.exercises.map((ex) => (
                    <li key={`${ex.name}-${ex.sets}`} className="py-3 text-sm">
                      <p className="font-semibold text-paper">{ex.name}</p>
                      <p className="text-muted">
                        {ex.sets} × {ex.reps}
                        {ex.notes ? ` · ${ex.notes}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      )}
    </AppShell>
  );
}
