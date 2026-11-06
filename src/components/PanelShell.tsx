"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SafeUserButton } from "@/components/SafeUserButton";

export type PanelLink = {
  href: string;
  label: string;
};

type Props = {
  brandHref: string;
  brandSuffix?: string;
  links: readonly PanelLink[];
  title: string;
  eyebrow?: string;
  description?: string;
  children: React.ReactNode;
  marquee?: readonly string[];
};

export function PanelShell({
  brandHref,
  brandSuffix,
  links,
  title,
  eyebrow,
  description,
  children,
  marquee = ["Plan", "Check-in", "Chat", "Progreso", "Hábitos"],
}: Props) {
  const pathname = usePathname();
  const items = [...marquee, ...marquee];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-ink text-paper">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_top,_rgba(212,255,63,0.12),_transparent_55%)]"
        aria-hidden="true"
      />

      <header className="sticky top-0 z-50 border-b border-paper/10 bg-ink/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:h-[4.5rem] sm:px-8">
          <Link
            href={brandHref}
            className="flex items-baseline gap-2"
            aria-label="Gymbros"
          >
            <span className="font-display text-2xl font-extrabold tracking-tight sm:text-[1.75rem]">
              GYMBROS
            </span>
            {brandSuffix ? (
              <span className="hidden text-xs font-semibold uppercase tracking-[0.22em] text-lime sm:inline">
                {brandSuffix}
              </span>
            ) : null}
          </Link>

          <nav
            className="hidden items-center gap-8 md:flex"
            aria-label="Panel"
          >
            {links.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== brandHref && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition-colors ${
                    active ? "text-lime" : "text-paper/80 hover:text-lime"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <SafeUserButton />
          </div>
        </div>
      </header>

      <div
        className="overflow-hidden border-b border-paper/10 bg-lime py-2.5 text-ink"
        aria-hidden="true"
      >
        <div className="marquee-track flex w-max gap-10 pr-10">
          {items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="font-display text-xl font-extrabold uppercase tracking-[0.18em] sm:text-2xl"
            >
              {item}
              <span className="ml-10">/</span>
            </span>
          ))}
        </div>
      </div>

      <main className="relative mx-auto max-w-6xl px-5 pb-28 pt-10 sm:px-8 sm:pt-14">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-3 font-display text-[clamp(2.6rem,8vw,4.75rem)] font-extrabold uppercase leading-[0.88] tracking-tight">
            {title}
          </h1>
          {description ? (
            <p className="mt-4 max-w-xl text-base leading-relaxed text-paper/70 sm:text-lg">
              {description}
            </p>
          ) : null}
        </div>
        <div className="mt-10 sm:mt-12">{children}</div>
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-paper/10 bg-ink/90 backdrop-blur-md md:hidden"
        aria-label="Navegación móvil"
      >
        <ul className="mx-auto flex max-w-6xl items-stretch justify-around px-2 py-2">
          {links.slice(0, 5).map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== brandHref && pathname.startsWith(link.href));
            return (
              <li key={link.href} className="flex-1">
                <Link
                  href={link.href}
                  className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold uppercase tracking-wider ${
                    active ? "text-lime" : "text-paper/55"
                  }`}
                >
                  <span
                    className={`h-1 w-1 rounded-full ${active ? "bg-lime" : "bg-transparent"}`}
                    aria-hidden="true"
                  />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
