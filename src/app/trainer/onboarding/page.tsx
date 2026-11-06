"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function TrainerOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/trainer/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          bio: form.get("bio"),
          specialties: form.get("specialties"),
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Error");
      router.push("/trainer");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink text-paper">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(ellipse_at_top,_rgba(212,255,63,0.12),_transparent_55%)]"
        aria-hidden="true"
      />
      <div
        className="overflow-hidden border-b border-paper/10 bg-lime py-2.5 text-ink"
        aria-hidden="true"
      >
        <div className="marquee-track flex w-max gap-10 pr-10">
          {Array.from({ length: 2 }).flatMap((_, i) =>
            ["Coach", "Perfil", "Clientes", "Gymbros"].map((item) => (
              <span
                key={`${item}-${i}`}
                className="font-display text-xl font-extrabold uppercase tracking-[0.18em]"
              >
                {item}
                <span className="ml-10">/</span>
              </span>
            )),
          )}
        </div>
      </div>
      <main className="relative mx-auto max-w-xl px-5 py-14 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime">
          Entrenador
        </p>
        <h1 className="mt-3 font-display text-[clamp(2.8rem,9vw,4.5rem)] font-extrabold uppercase leading-[0.88] tracking-tight">
          Completa tu perfil
        </h1>
        <p className="mt-4 text-base text-paper/70 sm:text-lg">
          Así te presentamos a los alumnos del plan humano cuando te asignen.
        </p>
        <form onSubmit={onSubmit} className="mt-10 grid gap-4">
          <label className="grid gap-2 text-sm">
            <span className="text-muted">Nombre público</span>
            <input
              name="name"
              required
              className="rounded-2xl border border-paper/15 bg-ink-soft px-4 py-3 outline-none ring-lime focus:ring-2"
              placeholder="Tu nombre"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-muted">Especialidades</span>
            <input
              name="specialties"
              required
              className="rounded-2xl border border-paper/15 bg-ink-soft px-4 py-3 outline-none ring-lime focus:ring-2"
              placeholder="Fuerza, pérdida de grasa, movilidad…"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-muted">Bio</span>
            <textarea
              name="bio"
              required
              rows={4}
              className="rounded-2xl border border-paper/15 bg-ink-soft px-4 py-3 outline-none ring-lime focus:ring-2"
              placeholder="Experiencia, enfoque y cómo trabajas con clientes…"
            />
          </label>
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-lime px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-lime-deep disabled:opacity-60"
          >
            {loading ? "Guardando…" : "Ir al panel"}
          </button>
        </form>
      </main>
    </div>
  );
}
