import { PanelShell } from "@/components/PanelShell";

const links = [
  { href: "/trainer", label: "Clientes" },
  { href: "/trainer/onboarding", label: "Perfil" },
] as const;

export function TrainerShell({
  children,
  title,
  eyebrow = "Panel coach",
  description,
}: {
  children: React.ReactNode;
  title: string;
  eyebrow?: string;
  description?: string;
}) {
  return (
    <PanelShell
      brandHref="/trainer"
      brandSuffix="Coach"
      links={links}
      title={title}
      eyebrow={eyebrow}
      description={description}
      marquee={[
        "Clientes",
        "Salud",
        "Mensajes",
        "Planes",
        "Revisiones",
        "Cola",
      ]}
    >
      {children}
    </PanelShell>
  );
}
