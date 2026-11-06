"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function CheckoutInner() {
  const params = useSearchParams();
  const plan = params.get("plan") === "human" ? "human" : "ai";
  const canceled = params.get("canceled") === "1";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "No se pudo iniciar el pago");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de checkout");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime">
        Checkout
      </p>
      <h1 className="mt-3 font-display text-5xl font-extrabold uppercase tracking-tight">
        {plan === "human" ? "Entrenador real" : "Coach IA"}
      </h1>
      <p className="mt-4 text-paper/70">
        {plan === "human"
          ? "79€/mes · Entrenador asignado + dashboard Gymbros"
          : "19€/mes · Plan semanal y chat con IA"}
      </p>
      {canceled ? (
        <p className="mt-4 rounded-2xl border border-paper/15 bg-ink-soft p-4 text-sm text-paper/80">
          Checkout cancelado. Puedes intentarlo de nuevo cuando quieras.
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-950/30 p-4 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className="mt-8 inline-flex rounded-full bg-lime px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-lime-deep disabled:opacity-60"
      >
        {loading ? "Preparando…" : "Continuar"}
      </button>
      <p className="mt-3 text-xs text-muted">
        Si Stripe no está configurado, activamos un trial local para que puedas
        entrar al panel.
      </p>
      <a href="/app" className="mt-4 text-sm text-muted hover:text-lime">
        Ya tengo suscripción → ir a la app
      </a>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<main className="p-10 text-paper">Cargando…</main>}>
      <CheckoutInner />
    </Suspense>
  );
}
