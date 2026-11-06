"use client";

import { useRouter } from "next/navigation";
import { MemberProfileForm } from "@/components/MemberProfileForm";

export default function OnboardingPage() {
  const router = useRouter();

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
            ["Onboarding", "Salud", "Objetivo", "Plan"].map((item) => (
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
      <main className="relative mx-auto max-w-2xl px-5 py-14 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime">
          Onboarding
        </p>
        <h1 className="mt-3 font-display text-[clamp(2.8rem,9vw,4.5rem)] font-extrabold uppercase leading-[0.88] tracking-tight">
          Tu ficha de alumno
        </h1>
        <p className="mt-4 max-w-xl text-base text-paper/70 sm:text-lg">
          Cuanta más información (sobre todo de salud), mejor adaptan la IA y tu
          entrenador el plan.
        </p>
        <div className="mt-10">
          <MemberProfileForm
            submitLabel="Guardar y continuar"
            onSuccess={() => {
              router.push("/app");
              router.refresh();
            }}
          />
        </div>
      </main>
    </div>
  );
}
