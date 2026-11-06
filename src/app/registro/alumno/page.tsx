"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { levelOptions } from "@/lib/member-profile";

function RegistroAlumnoForm() {
  const searchParams = useSearchParams();
  const initialPlan =
    searchParams.get("plan") === "human" ? "human" : "ai";
  const [level, setLevel] = useState<(typeof levelOptions)[number]["value"] | "">(
    "",
  );
  const [plan, setPlan] = useState<"ai" | "human">(initialPlan);

  const href = useMemo(() => {
    if (!level) return null;
    const params = new URLSearchParams({
      role: "member",
      plan,
      level,
    });
    return `/sign-up?${params.toString()}`;
  }, [level, plan]);

  return (
    <main className="relative mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-5 py-16 sm:px-8">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[22rem] bg-[radial-gradient(ellipse_at_top,_rgba(212,255,63,0.12),_transparent_55%)]"
        aria-hidden="true"
      />
      <div className="relative">
        <Link
          href="/registro"
          className="text-sm text-paper/70 transition-colors hover:text-lime"
        >
          ← Cambiar tipo de cuenta
        </Link>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-lime">
          Registro alumno
        </p>
        <h1 className="mt-3 font-display text-[clamp(2.6rem,8vw,4.5rem)] font-extrabold uppercase leading-[0.88] tracking-tight">
          ¿Qué nivel tienes en el deporte?
        </h1>
        <p className="mt-4 max-w-xl text-base text-paper/70 sm:text-lg">
          Así la IA o tu entrenador parten del sitio correcto: técnica, volumen y
          progresión.
        </p>

        <fieldset className="mt-10">
          <legend className="sr-only">Nivel deportivo</legend>
          <ul className="space-y-3">
            {levelOptions.map((option, index) => {
              const active = level === option.value;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => setLevel(option.value)}
                    className={`flex w-full touch-manipulation items-start gap-4 rounded-[1.5rem] border px-5 py-5 text-left transition-colors active:scale-[0.99] sm:gap-6 ${
                      active
                        ? "border-lime bg-lime/10"
                        : "border-paper/10 bg-ink-soft hover:border-paper/25"
                    }`}
                  >
                    <span className="font-display text-2xl font-extrabold text-lime">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <span className="block font-display text-2xl font-bold uppercase tracking-tight">
                        {option.label}
                      </span>
                      <span className="mt-1 block text-sm text-paper/70">
                        {option.hint}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>

        <fieldset className="mt-10">
          <legend className="text-xs font-semibold uppercase tracking-[0.28em] text-lime">
            Plan inicial
          </legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(
              [
                {
                  id: "ai" as const,
                  title: "Coach IA",
                  text: "Plan y chat 24/7 con IA",
                },
                {
                  id: "human" as const,
                  title: "Entrenador real",
                  text: "Coach humano + mensajería",
                },
              ] as const
            ).map((option) => {
              const active = plan === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setPlan(option.id)}
                  className={`min-h-[4.5rem] touch-manipulation rounded-[1.25rem] border px-5 py-4 text-left transition-colors active:scale-[0.99] ${
                    active
                      ? "border-lime bg-ink"
                      : "border-paper/10 bg-ink-soft hover:border-paper/25"
                  }`}
                >
                  <span className="font-display text-xl font-bold uppercase tracking-tight">
                    {option.title}
                  </span>
                  <span className="mt-1 block text-sm text-muted">{option.text}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          {href ? (
            <Link
              href={href}
              className="inline-flex min-h-12 w-full touch-manipulation items-center justify-center rounded-full bg-lime px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-lime-deep sm:w-auto"
            >
              Continuar al registro
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-lime/40 px-6 py-3.5 text-sm font-semibold text-ink opacity-60 sm:w-auto"
            >
              Elige tu nivel para continuar
            </button>
          )}
          <p className="text-sm text-muted">Sin permanencia · Cancela cuando quieras</p>
        </div>
      </div>
    </main>
  );
}

export default function RegistroAlumnoPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-ink text-paper">
          <p className="text-muted">Cargando…</p>
        </main>
      }
    >
      <RegistroAlumnoForm />
    </Suspense>
  );
}
