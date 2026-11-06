import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { HumanChat } from "@/components/HumanChat";
import { TrainerShell } from "@/components/TrainerShell";
import { getDb } from "@/lib/db";
import { isLocalDbEnabled, localDb } from "@/lib/db/local-store";
import { profiles, users, workoutPlans } from "@/lib/db/schema";
import { ensureUser } from "@/lib/users";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ memberId: string }> };

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-paper/10 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
      <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </dt>
      <dd className="whitespace-pre-wrap text-sm text-paper/90 sm:text-base">
        {value || "—"}
      </dd>
    </div>
  );
}

export default async function TrainerClientPage({ params }: Props) {
  const user = await ensureUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "trainer" && user.role !== "admin") redirect("/app");

  const { memberId } = await params;

  const member = isLocalDbEnabled()
    ? localDb.findUserById(memberId)
    : await getDb().query.users.findFirst({ where: eq(users.id, memberId) });
  if (!member) redirect("/trainer");

  const profile = isLocalDbEnabled()
    ? localDb.findProfileByUserId(memberId)
    : await getDb().query.profiles.findFirst({
        where: eq(profiles.userId, memberId),
      });

  const plan = isLocalDbEnabled()
    ? localDb.findLatestPlan(memberId)
    : await getDb().query.workoutPlans.findFirst({
        where: eq(workoutPlans.userId, memberId),
        orderBy: [desc(workoutPlans.createdAt)],
      });

  const age = profile?.birthYear
    ? new Date().getFullYear() - profile.birthYear
    : null;
  const healthFlags = profile?.healthFlags ?? [];
  const hasHealthAlert =
    profile?.hasHealthConditions ||
    healthFlags.length > 0 ||
    Boolean(profile?.injuries?.trim()) ||
    Boolean(profile?.painAreas?.trim());

  return (
    <TrainerShell
      title={member.name ?? member.email}
      eyebrow="Ficha cliente"
      description="Datos de entrenamiento, salud y mensajería 1:1."
    >
      <Link
        href="/trainer"
        className="inline-flex touch-manipulation text-sm text-paper/70 transition-colors hover:text-lime"
      >
        ← Volver a clientes
      </Link>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-paper/10 bg-ink-soft p-7 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime">
              Entrenamiento
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight">
              Perfil
            </h2>
            <dl className="mt-2">
              <Row label="Email" value={member.email} />
              <Row label="Objetivo" value={profile?.goal} />
              <Row label="Nivel" value={profile?.experience} />
              <Row
                label="Días / min"
                value={
                  profile?.daysPerWeek
                    ? `${profile.daysPerWeek} días · ${profile.sessionMinutes ?? "—"} min`
                    : null
                }
              />
              <Row
                label="Material"
                value={(profile?.equipment ?? []).join(", ") || null}
              />
              <Row label="Disponibilidad" value={profile?.availabilityNotes} />
              <Row
                label="Antropometría"
                value={
                  [
                    age ? `~${age} años` : null,
                    profile?.sex,
                    profile?.heightCm ? `${profile.heightCm} cm` : null,
                    profile?.weightKg ? `${profile.weightKg} kg` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || null
                }
              />
              <Row label="Notas" value={profile?.notes} />
            </dl>
          </section>

          <section
            className={`rounded-[1.75rem] border p-7 sm:p-8 ${
              hasHealthAlert
                ? "border-lime bg-ink"
                : "border-paper/10 bg-ink-soft"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime">
              Salud
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight">
              Prioridad coach
            </h2>
            {healthFlags.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {healthFlags.map((flag) => (
                  <span
                    key={flag}
                    className="rounded-full border border-lime/40 bg-lime/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-lime"
                  >
                    {flag.replaceAll("_", " ")}
                  </span>
                ))}
              </div>
            ) : null}
            <dl className="mt-2">
              <Row
                label="Condiciones"
                value={
                  profile?.hasHealthConditions
                    ? profile.healthConditions || "Declaradas (sin detalle)"
                    : "Ninguna declarada"
                }
              />
              <Row label="Lesiones" value={profile?.injuries} />
              <Row label="Dolor" value={profile?.painAreas} />
              <Row label="Medicación" value={profile?.medications} />
              <Row label="Evitar" value={profile?.contraindications} />
              <Row
                label="Alta médica"
                value={
                  profile?.doctorClearance === true
                    ? "Sí"
                    : profile?.doctorClearance === false
                      ? "No / pendiente"
                      : null
                }
              />
              <Row
                label="Embarazo / postparto"
                value={profile?.pregnancyOrPostpartum ? "Sí" : "No"}
              />
              <Row
                label="Estilo de vida"
                value={
                  [
                    profile?.sleepHours != null
                      ? `${profile.sleepHours}h sueño`
                      : null,
                    profile?.stressLevel
                      ? `estrés ${profile.stressLevel}`
                      : null,
                    profile?.activityJob,
                  ]
                    .filter(Boolean)
                    .join(" · ") || null
                }
              />
              {profile?.coachNotes ? (
                <Row label="Notas coach" value={profile.coachNotes} />
              ) : null}
            </dl>
          </section>

          <section className="rounded-[1.75rem] border border-paper/10 bg-paper p-7 text-ink sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink/45">
              Plan
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight">
              {plan?.title ?? "Sin plan"}
            </h2>
            <p className="mt-2 text-sm text-ink/65">{plan?.summary ?? ""}</p>
          </section>
        </div>

        <section>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-lime">
            Mensajes
          </p>
          <HumanChat memberId={memberId} asTrainer />
        </section>
      </div>
    </TrainerShell>
  );
}
