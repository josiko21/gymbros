"use client";

import { useCallback, useEffect, useState } from "react";
import type { WorkoutDay, WorkoutPlan } from "@/lib/db/schema";

type Props = {
  plan: WorkoutPlan | null;
};

function pickToday(days: WorkoutDay[]): WorkoutDay | null {
  if (!days.length) return null;
  const weekday = new Date().toLocaleDateString("es-ES", { weekday: "long" });
  const normalized = weekday.toLowerCase();
  const match = days.find((d) =>
    d.day.toLowerCase().includes(normalized.slice(0, 3)),
  );
  return match ?? days[0] ?? null;
}

export function TodayWorkout({ plan }: Props) {
  const today = plan ? pickToday(plan.days) : null;
  const [done, setDone] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!today) return;
    const res = await fetch("/api/exercises");
    if (!res.ok) return;
    const data = (await res.json()) as {
      logs?: { exerciseName: string; dayLabel: string }[];
    };
    const next = new Set(
      (data.logs ?? [])
        .filter((l) => l.dayLabel === today.day)
        .map((l) => l.exerciseName),
    );
    setDone(next);
  }, [today]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggle(exerciseName: string) {
    if (!today || !plan) return;
    const completed = !done.has(exerciseName);
    setLoading(true);
    setDone((prev) => {
      const next = new Set(prev);
      if (completed) next.add(exerciseName);
      else next.delete(exerciseName);
      return next;
    });
    await fetch("/api/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId: plan.id,
        dayLabel: today.day,
        exerciseName,
        completed,
      }),
    });
    setLoading(false);
  }

  if (!plan || !today) {
    return (
      <div className="rounded-[1.75rem] border border-paper/10 bg-ink-soft p-7 sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime">
          Hoy
        </p>
        <h2 className="mt-3 font-display text-4xl font-extrabold uppercase tracking-tight">
          Sin rutina todavía
        </h2>
        <p className="mt-3 max-w-md text-paper/70">
          Completa el onboarding o espera a que tu entrenador te asigne un plan.
        </p>
      </div>
    );
  }

  const total = today.exercises.length;
  const finished = today.exercises.filter((e) => done.has(e.name)).length;
  const pct = total ? Math.round((finished / total) * 100) : 0;

  return (
    <div className="rounded-[1.75rem] border border-paper/10 bg-ink-soft p-7 sm:p-9">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime">
            Rutina de hoy
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold uppercase leading-[0.92] tracking-tight sm:text-5xl">
            {today.day}
            <span className="block text-lime">{today.focus}</span>
          </h2>
          <p className="mt-3 text-sm text-muted">
            {finished}/{total} ejercicios · {plan.title}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-5xl font-extrabold text-lime">{pct}%</p>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">hecho</p>
        </div>
      </div>

      <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-ink">
        <div
          className="h-full rounded-full bg-lime transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="mt-8 divide-y divide-paper/10 border-y border-paper/10">
        {today.exercises.map((ex, index) => {
          const isDone = done.has(ex.name);
          return (
            <li key={ex.name}>
              <button
                type="button"
                disabled={loading}
                onClick={() => void toggle(ex.name)}
                className="flex w-full items-start gap-4 py-5 text-left transition-colors hover:bg-ink/40 sm:gap-6"
              >
                <span
                  className={`mt-1 font-display text-xl font-extrabold ${
                    isDone ? "text-lime" : "text-paper/25"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                    isDone
                      ? "border-lime bg-lime text-ink"
                      : "border-paper/30 text-transparent"
                  }`}
                  aria-hidden="true"
                >
                  ✓
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block font-display text-xl font-bold uppercase tracking-tight sm:text-2xl ${
                      isDone ? "text-paper/55 line-through" : "text-paper"
                    }`}
                  >
                    {ex.name}
                  </span>
                  <span className="mt-1 block text-sm text-muted">
                    {ex.sets} × {ex.reps}
                    {ex.notes ? ` · ${ex.notes}` : ""}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
