import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { ClerkMissing } from "@/components/ClerkMissing";
import { isClerkConfigured } from "@/lib/clerk";
import { normalizeLevel } from "@/lib/member-profile";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ plan?: string; role?: string; level?: string }>;
};

export default async function SignUpPage({ searchParams }: Props) {
  const params = await searchParams;
  const role = params.role === "trainer" ? "trainer" : "member";
  const plan = params.plan === "human" ? "human" : "ai";
  const level = normalizeLevel(params.level);

  if (role === "member" && !level) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-ink px-5 py-16">
        <div className="mx-auto max-w-md text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime">
            Registro alumno
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold uppercase tracking-tight">
            Falta tu nivel
          </h1>
          <p className="mt-3 text-paper/70">
            Antes de crear la cuenta, indícanos qué nivel tienes en el deporte.
          </p>
          <Link
            href={`/registro/alumno${plan === "human" ? "?plan=human" : ""}`}
            className="mt-8 inline-flex rounded-full bg-lime px-6 py-3.5 text-sm font-semibold text-ink"
          >
            Elegir nivel
          </Link>
        </div>
      </main>
    );
  }

  if (!isClerkConfigured()) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink px-5 py-16">
        <ClerkMissing intent="sign-up" />
      </main>
    );
  }

  const redirectUrl =
    role === "trainer" ? "/post-auth" : `/checkout?plan=${plan}`;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-ink px-5 py-16">
      <div className="text-center">
        <p className="text-sm text-muted">
          Registro Gymbros ·{" "}
          <span className="text-lime">
            {role === "trainer" ? "Entrenador personal" : "Alumno"}
          </span>
        </p>
        {role === "member" ? (
          <p className="mt-1 text-xs text-muted">
            Nivel: <span className="text-lime">{level}</span>
            {" · "}
            Plan: {plan === "human" ? "Entrenador real" : "Coach IA"}
          </p>
        ) : null}
        <Link
          href={role === "member" ? "/registro/alumno" : "/registro"}
          className="mt-2 inline-block text-xs text-lime hover:underline"
        >
          {role === "member" ? "Cambiar nivel o plan" : "Cambiar tipo de cuenta"}
        </Link>
      </div>
      <SignUp
        forceRedirectUrl={redirectUrl}
        signInUrl="/sign-in"
        unsafeMetadata={{
          role,
          ...(level ? { experience: level } : {}),
        }}
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-ink-soft border border-paper/10 shadow-none",
          },
        }}
      />
    </main>
  );
}
