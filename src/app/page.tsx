import Image from "next/image";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import {
  faqs,
  images,
  method,
  nav,
  paths,
  plans,
  site,
  stats,
  testimonials,
} from "@/lib/site";

const marquee = [
  "Coach IA",
  "Entrenador real",
  "Planes semanales",
  "Suscripción",
  "Fuerza",
  "Pérdida de grasa",
  "Hábitos",
  "Chat 24/7",
];

export default function Home() {
  return (
    <>
      <JsonLd />
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-lime focus:px-4 focus:py-2 focus:text-ink"
      >
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido">
        <Hero />
        <Marquee />
        <Paths />
        <Plans />
        <Method />
        <Results />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}

function Hero() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden border-b border-paper/10"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto grid max-w-6xl items-end gap-10 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-24 lg:pt-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime">
            {site.tagline}
          </p>
          <h1
            id="hero-heading"
            className="mt-5 font-display text-[clamp(3.4rem,11vw,7.4rem)] font-extrabold leading-[0.84] tracking-tight text-paper"
          >
            Tu actividad física.
            <span className="block text-lime">Con IA o con un humano.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-paper/75 sm:text-xl">
            Gymbros es la suscripción para entrenar con un coach de inteligencia
            artificial o con un entrenador personal real. Un plan que se cumple,
            chat cuando lo necesitas y seguimiento en una sola app.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="/registro"
              className="inline-flex rounded-full bg-lime px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-lime-deep"
            >
              Empezar ahora
            </a>
            <a
              href="#planes"
              className="inline-flex rounded-full border border-paper/20 px-6 py-3.5 text-sm font-semibold text-paper transition-colors hover:border-lime hover:text-lime"
            >
              Ver planes
            </a>
          </div>
          <p className="mt-6 text-sm text-muted">
            Sin permanencia · Cancela cuando quieras · Setup en minutos
          </p>
        </div>

        <div className="relative">
          <div
            className="absolute -inset-3 rounded-[2rem] bg-lime/15 sm:-right-6 sm:top-8 sm:bottom-[-1.5rem]"
            aria-hidden="true"
          />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-paper/10 sm:aspect-[5/6]">
            <Image
              src={images.hero.src}
              alt={images.hero.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover"
            />
          </div>
          <aside className="absolute bottom-4 left-4 right-4 rounded-2xl border border-paper/10 bg-ink/80 p-4 backdrop-blur-md sm:bottom-8 sm:-left-10 sm:right-auto sm:w-64">
            <p className="font-display text-4xl font-extrabold leading-none text-lime">
              2
            </p>
            <p className="mt-1 text-sm text-paper/80">
              caminos. Misma app. Elige IA o entrenador real.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = [...marquee, ...marquee];
  return (
    <div
      className="overflow-hidden border-b border-paper/10 bg-lime py-3 text-ink"
      aria-hidden="true"
    >
      <div className="marquee-track flex w-max gap-10 pr-10">
        {items.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="font-display text-2xl font-extrabold uppercase tracking-[0.18em] sm:text-3xl"
          >
            {item}
            <span className="ml-10">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Paths() {
  return (
    <section
      id="caminos"
      className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28"
      aria-labelledby="caminos-heading"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime">
            Caminos
          </p>
          <h2
            id="caminos-heading"
            className="mt-3 max-w-xl font-display text-5xl font-extrabold uppercase leading-[0.92] tracking-tight sm:text-6xl"
          >
            IA o humano. Tú decides.
          </h2>
        </div>
        <p className="max-w-sm text-paper/70">
          Misma estructura de plan y seguimiento. Cambia el tipo de coach, no la
          calidad del sistema.
        </p>
      </div>

      <ul className="mt-12 divide-y divide-paper/10 border-y border-paper/10">
        {paths.map((path) => (
          <li
            key={path.id}
            className="grid gap-3 py-8 transition-colors hover:bg-ink-soft/60 sm:grid-cols-[5rem_1fr_1.2fr] sm:items-baseline sm:gap-8 sm:px-2"
          >
            <span className="font-display text-3xl font-extrabold text-lime">
              {path.number}
            </span>
            <h3 className="font-display text-3xl font-bold uppercase leading-none tracking-tight sm:text-4xl">
              {path.title}
            </h3>
            <p className="text-paper/70">{path.description}</p>
          </li>
        ))}
      </ul>

      <dl className="mt-14 grid grid-cols-2 gap-6 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt className="font-display text-4xl font-extrabold tracking-tight text-lime sm:text-5xl">
              {stat.value}
              <span className="text-2xl">{stat.suffix}</span>
            </dt>
            <dd className="mt-1 text-sm text-muted">{stat.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Plans() {
  return (
    <section
      id="planes"
      className="border-y border-paper/10 bg-ink-soft"
      aria-labelledby="planes-heading"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime">
            Planes
          </p>
          <h2
            id="planes-heading"
            className="mt-3 font-display text-5xl font-extrabold uppercase leading-[0.92] tracking-tight sm:text-6xl"
          >
            Suscripción clara. Sin permanencia.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`flex flex-col rounded-[1.5rem] border p-7 sm:p-9 ${
                plan.highlighted
                  ? "border-lime bg-ink text-paper"
                  : "border-paper/10 bg-ink/40"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lime">
                {plan.badge}
              </p>
              <h3 className="mt-3 font-display text-4xl font-extrabold uppercase tracking-tight">
                {plan.name}
              </h3>
              <p className="mt-2 text-paper/70">{plan.description}</p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-5xl font-extrabold text-lime">
                  {plan.price}€
                </span>
                <span className="text-muted">{plan.period}</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-paper/80">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="text-lime" aria-hidden="true">
                      +
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href={plan.href}
                className={`mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold transition-colors active:scale-[0.99] sm:w-auto ${
                  plan.highlighted
                    ? "bg-lime text-ink hover:bg-lime-deep"
                    : "border border-paper/20 text-paper hover:border-lime hover:text-lime"
                }`}
              >
                {plan.cta}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Method() {
  return (
    <section
      id="metodo"
      className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28"
      aria-labelledby="metodo-heading"
    >
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime">
          Método
        </p>
        <h2
          id="metodo-heading"
          className="mt-3 font-display text-5xl font-extrabold uppercase leading-[0.92] tracking-tight sm:text-6xl"
        >
          Cuatro pasos. Cero humo.
        </h2>
      </div>
      <ol className="mt-14 grid gap-6 sm:grid-cols-2">
        {method.map((item) => (
          <li
            key={item.step}
            className="rounded-[1.5rem] border border-paper/10 bg-ink-soft p-7"
          >
            <span className="font-display text-5xl font-extrabold text-lime/90">
              {item.step}
            </span>
            <h3 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight">
              {item.title}
            </h3>
            <p className="mt-3 text-paper/70">{item.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Results() {
  return (
    <section
      id="resultados"
      className="border-y border-paper/10 bg-paper text-ink"
      aria-labelledby="resultados-heading"
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink/50">
            Resultados
          </p>
          <h2
            id="resultados-heading"
            className="mt-3 font-display text-5xl font-extrabold uppercase leading-[0.92] tracking-tight sm:text-6xl"
          >
            Lo que dicen quienes ya entrenan con Gymbros
          </h2>
          <div className="relative mt-10 hidden aspect-[4/5] overflow-hidden rounded-[1.75rem] lg:block">
            <Image
              src={images.session.src}
              alt={images.session.alt}
              fill
              sizes="40vw"
              className="object-cover"
            />
          </div>
        </div>
        <ul className="space-y-6">
          {testimonials.map((item) => (
            <li
              key={item.name}
              className="rounded-[1.5rem] border border-ink/10 bg-paper-muted p-7"
            >
              <blockquote>
                <p className="text-lg leading-relaxed text-ink/85">
                  “{item.quote}”
                </p>
                <footer className="mt-5">
                  <cite className="not-italic">
                    <span className="block font-semibold">{item.name}</span>
                    <span className="text-sm text-ink/55">{item.role}</span>
                  </cite>
                </footer>
              </blockquote>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section
      id="faq"
      className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime">
          Preguntas frecuentes
        </p>
        <h2
          id="faq-heading"
          className="mt-3 font-display text-5xl font-extrabold uppercase leading-[0.92] tracking-tight sm:text-6xl"
        >
          Antes de suscribirte
        </h2>
      </div>
      <div className="mt-12 divide-y divide-paper/10 border-y border-paper/10">
        {faqs.map((faq) => (
          <details key={faq.question} className="group py-5">
            <summary className="cursor-pointer list-none font-display text-2xl font-bold uppercase tracking-tight marker:content-none sm:text-3xl">
              <span className="flex items-start justify-between gap-6">
                {faq.question}
                <span
                  className="mt-1 text-lime transition group-open:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </span>
            </summary>
            <p className="mt-4 max-w-3xl text-paper/70">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section
      id="empezar"
      className="border-t border-paper/10 bg-ink-soft"
      aria-labelledby="cta-heading"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-20 sm:px-8 sm:py-28 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime">
            Empieza
          </p>
          <h2
            id="cta-heading"
            className="mt-3 font-display text-5xl font-extrabold uppercase leading-[0.92] tracking-tight sm:text-6xl"
          >
            Crea tu cuenta y elige tu camino
          </h2>
          <p className="mt-6 max-w-md text-lg text-paper/75">
            Regístrate, elige Coach IA o entrenador real y en minutos tienes tu
            primer plan. ¿Dudas? Escríbenos a{" "}
            <a className="text-lime hover:underline" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href="/registro/alumno?plan=ai"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-lime px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-lime-deep sm:w-auto"
          >
            Empezar con IA
          </a>
          <a
            href="/registro/alumno?plan=human"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-paper/20 px-6 py-3.5 text-sm font-semibold text-paper transition-colors hover:border-lime hover:text-lime sm:w-auto"
          >
            Quiero entrenador
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-paper/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div>
          <p className="font-display text-3xl font-extrabold tracking-tight">
            GYMBROS
          </p>
          <p className="mt-2 max-w-xs text-sm text-muted">
            Actividad física con suscripción. Coach IA o entrenador real.
          </p>
        </div>
        <nav className="flex flex-wrap gap-5 text-sm text-paper/70" aria-label="Pie">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-lime">
              {item.label}
            </a>
          ))}
          <a href="/sign-in" className="hover:text-lime">
            Entrar
          </a>
        </nav>
      </div>
      <div className="border-t border-paper/10">
        <p className="mx-auto max-w-6xl px-5 py-5 text-xs text-muted sm:px-8">
          © {new Date().getFullYear()} {site.legalName}. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
