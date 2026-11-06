import { PanelShell, type PanelLink } from "@/components/PanelShell";

const baseLinks: PanelLink[] = [
  { href: "/app", label: "Hoy" },
  { href: "/app/plan", label: "Plan" },
  { href: "/app/perfil", label: "Ficha" },
];

export function AppShell({
  children,
  title,
  eyebrow = "Panel alumno",
  description,
  coachingMode,
}: {
  children: React.ReactNode;
  title: string;
  eyebrow?: string;
  description?: string;
  coachingMode?: "ai" | "human" | null;
}) {
  const links: PanelLink[] = [
    ...baseLinks,
    coachingMode === "human"
      ? { href: "/app/messages", label: "Msgs" }
      : { href: "/app/chat", label: "Chat" },
  ];

  return (
    <PanelShell
      brandHref="/app"
      brandSuffix="Alumno"
      links={links}
      title={title}
      eyebrow={eyebrow}
      description={description}
      marquee={[
        "Hoy",
        "Plan semanal",
        "Check-in",
        coachingMode === "human" ? "Entrenador" : "Coach IA",
        "Salud",
        "Progreso",
      ]}
    >
      {children}
    </PanelShell>
  );
}
