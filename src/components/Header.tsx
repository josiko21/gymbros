"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { nav, plans } from "@/lib/site";

export function Header() {
  const [open, setOpen] = useState(false);
  const navId = useId();

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function close() {
    setOpen(false);
  }

  function goToSection(href: string) {
    close();
    // Esperar a quitar el overlay / unlock scroll antes de saltar
    window.setTimeout(() => {
      const id = href.startsWith("#") ? href.slice(1) : href;
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(null, "", href);
      }
    }, 50);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-paper/10 bg-ink/90 backdrop-blur-md">
      <div className="relative z-[60] mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:h-[4.5rem] sm:px-8">
        <a
          href="#inicio"
          className="flex items-baseline gap-2"
          aria-label="Inicio"
          onClick={(e) => {
            e.preventDefault();
            goToSection("#inicio");
          }}
        >
          <span className="font-display text-2xl font-extrabold tracking-tight text-paper sm:text-[1.75rem]">
            GYMBROS
          </span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Principal">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-paper/80 transition-colors hover:text-lime"
              onClick={(e) => {
                e.preventDefault();
                goToSection(item.href);
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/sign-in"
            className="hidden text-sm text-paper/80 transition-colors hover:text-lime sm:inline-flex"
          >
            Entrar
          </Link>
          <Link
            href="/registro"
            className="hidden rounded-full bg-lime px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-lime-deep sm:inline-flex"
          >
            Empezar
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border border-paper/25 bg-ink-soft lg:hidden"
            aria-expanded={open}
            aria-controls={navId}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">Menú</span>
            <span className="relative block h-3.5 w-4" aria-hidden="true">
              <span
                className={`absolute left-0 top-0 block h-0.5 w-4 rounded-full bg-paper transition-transform duration-200 ${
                  open ? "translate-y-[6px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[6px] block h-0.5 w-4 rounded-full bg-paper transition-opacity duration-200 ${
                  open ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[12px] block h-0.5 w-4 rounded-full bg-paper transition-transform duration-200 ${
                  open ? "-translate-y-[6px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Solo montar overlay cuando está abierto: evita bloquear taps en iOS */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-ink/75"
            aria-label="Cerrar menú"
            onClick={close}
          />
          <nav
            id={navId}
            className="absolute inset-x-0 top-0 max-h-[100dvh] overflow-y-auto overscroll-contain border-b border-paper/10 bg-ink pt-16 shadow-2xl sm:pt-[4.5rem]"
            aria-label="Móvil"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-5 pb-10 sm:px-8">
              {nav.map((item) => (
                <button
                  key={item.href}
                  type="button"
                  className="rounded-2xl px-3 py-4 text-left text-lg font-medium text-paper touch-manipulation active:bg-ink-soft"
                  onClick={() => goToSection(item.href)}
                >
                  {item.label}
                </button>
              ))}

              <div className="my-3 border-t border-paper/10 pt-4">
                <p className="px-3 text-xs font-semibold uppercase tracking-[0.28em] text-lime">
                  Planes
                </p>
                <div className="mt-2 grid gap-2">
                  {plans.map((plan) => (
                    <Link
                      key={plan.id}
                      href={plan.href}
                      onClick={close}
                      className={`touch-manipulation rounded-2xl border px-4 py-4 active:scale-[0.99] ${
                        plan.highlighted
                          ? "border-lime bg-lime/10"
                          : "border-paper/15 bg-ink-soft"
                      }`}
                    >
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="font-display text-xl font-bold uppercase tracking-tight">
                          {plan.name}
                        </span>
                        <span className="font-display text-lg font-extrabold text-lime">
                          {plan.price}€
                        </span>
                      </span>
                      <span className="mt-1 block text-sm text-paper/65">
                        {plan.description}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-2 grid gap-3 border-t border-paper/10 pt-4">
                <Link
                  href="/sign-in"
                  onClick={close}
                  className="inline-flex min-h-12 touch-manipulation items-center justify-center rounded-full border border-paper/20 px-5 text-sm font-semibold text-paper"
                >
                  Entrar
                </Link>
                <Link
                  href="/registro"
                  onClick={close}
                  className="inline-flex min-h-12 touch-manipulation items-center justify-center rounded-full bg-lime px-5 text-sm font-semibold text-ink"
                >
                  Empezar ahora
                </Link>
              </div>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
