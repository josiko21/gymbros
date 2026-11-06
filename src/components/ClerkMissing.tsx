import Link from "next/link";

export function ClerkMissing({ intent }: { intent: "sign-in" | "sign-up" }) {
  return (
    <div className="mx-auto max-w-lg rounded-[1.75rem] border border-lime/40 bg-ink-soft p-8 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime">
        Configuración
      </p>
      <h1 className="mt-3 font-display text-4xl font-extrabold uppercase tracking-tight">
        Faltan las claves de Clerk
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-paper/70">
        Crea un archivo{" "}
        <code className="text-lime">.env.local</code> con{" "}
        <code className="text-lime">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> y{" "}
        <code className="text-lime">CLERK_SECRET_KEY</code> (copia desde{" "}
        <code className="text-lime">.env.example</code>) y reinicia{" "}
        <code className="text-lime">pnpm dev</code>.
      </p>
      <p className="mt-3 text-sm text-muted">
        Sin eso no se puede {intent === "sign-in" ? "iniciar sesión" : "registrar"}.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-full bg-lime px-5 py-3 text-sm font-semibold text-ink"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
