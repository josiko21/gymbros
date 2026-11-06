import Link from "next/link";

export default function RegistroPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-5 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime">
        Registro Gymbros
      </p>
      <h1 className="mt-3 font-display text-5xl font-extrabold uppercase leading-[0.92] tracking-tight sm:text-6xl">
        ¿Cómo vas a usar Gymbros?
      </h1>
      <p className="mt-4 max-w-xl text-lg text-paper/70">
        Elige tu tipo de cuenta. Podrás cambiar de plan después; el rol define tu
        panel.
      </p>

      <div className="mt-12 grid gap-4 md:grid-cols-2 md:gap-6">
        <Link
          href="/registro/alumno"
          className="group touch-manipulation rounded-[1.5rem] border border-paper/10 bg-ink-soft p-7 transition-colors active:border-lime hover:border-lime sm:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lime">
            Alumno
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight">
            Quiero entrenar
          </h2>
          <p className="mt-3 text-paper/70">
            Primero nos dices tu nivel en el deporte. Luego eliges IA o
            entrenador real y creas la cuenta.
          </p>
          <span className="mt-6 inline-flex text-sm font-semibold text-lime">
            Elegir nivel y registrarme →
          </span>
        </Link>

        <Link
          href="/sign-up?role=trainer"
          className="group touch-manipulation rounded-[1.5rem] border border-paper/10 bg-ink-soft p-7 transition-colors active:border-lime hover:border-lime sm:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lime">
            Entrenador
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight">
            Quiero entrenar a gente
          </h2>
          <p className="mt-3 text-paper/70">
            Panel de clientes, cola de alumnos, ficha de salud y mensajería 1:1.
          </p>
          <span className="mt-6 inline-flex text-sm font-semibold text-lime">
            Crear cuenta de entrenador →
          </span>
        </Link>
      </div>

      <p className="mt-10 text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href="/sign-in" className="text-lime hover:underline">
          Entrar
        </Link>
      </p>
    </main>
  );
}
