import Link from "next/link";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ClaimClientButton } from "@/components/ClaimClientButton";
import { TrainerShell } from "@/components/TrainerShell";
import { getDb } from "@/lib/db";
import { isLocalDbEnabled, localDb } from "@/lib/db/local-store";
import { profiles, trainerAssignments, users } from "@/lib/db/schema";
import { ensureUser } from "@/lib/users";

export const dynamic = "force-dynamic";

function HealthBadges({ flags }: { flags: string[] | null | undefined }) {
  if (!flags?.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {flags.slice(0, 3).map((flag) => (
        <span
          key={flag}
          className="rounded-full border border-lime/35 bg-lime/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-lime"
        >
          {flag.replaceAll("_", " ")}
        </span>
      ))}
      {flags.length > 3 ? (
        <span className="text-[10px] text-muted">+{flags.length - 3}</span>
      ) : null}
    </div>
  );
}

export default async function TrainerPage() {
  const user = await ensureUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "trainer" && user.role !== "admin") {
    redirect("/app");
  }
  if (user.role === "trainer" && !user.trainerOnboardingComplete) {
    redirect("/trainer/onboarding");
  }

  const clients = isLocalDbEnabled()
    ? localDb.listTrainerClients(user.id)
    : await getDb()
        .select({
          assignment: trainerAssignments,
          member: users,
          profile: profiles,
        })
        .from(trainerAssignments)
        .innerJoin(users, eq(trainerAssignments.memberId, users.id))
        .leftJoin(profiles, eq(profiles.userId, users.id))
        .where(eq(trainerAssignments.trainerId, user.id));

  const pending = isLocalDbEnabled()
    ? localDb.listPendingAssignments()
    : await getDb()
        .select({
          assignment: trainerAssignments,
          member: users,
          profile: profiles,
        })
        .from(trainerAssignments)
        .innerJoin(users, eq(trainerAssignments.memberId, users.id))
        .leftJoin(profiles, eq(profiles.userId, users.id))
        .where(eq(trainerAssignments.status, "pending"));

  const active = clients.filter((c) => c.assignment.status === "active");
  const healthAlerts = clients.filter(
    (c) => (c.profile?.healthFlags?.length ?? 0) > 0,
  ).length;

  return (
    <TrainerShell
      title="Tus clientes"
      eyebrow="Panel coach"
      description="Cola de alumnos, ficha de salud, plan y chat 1:1 con la misma estética Gymbros."
    >
      <section className="rounded-[1.75rem] border border-lime bg-ink p-7 sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime">
          Coach
        </p>
        <h2 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
          {user.name ?? "Tu perfil"}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-paper/70">
          {user.specialties || "Completa especialidades en Perfil"}
          {user.bio ? ` · ${user.bio}` : ""}
        </p>
        <Link
          href="/trainer/onboarding"
          className="mt-5 inline-flex min-h-11 touch-manipulation items-center rounded-full border border-paper/20 px-5 text-sm font-semibold hover:border-lime hover:text-lime"
        >
          Editar perfil coach
        </Link>
      </section>

      <dl className="mt-10 grid grid-cols-2 gap-6 border-b border-paper/10 pb-10 lg:grid-cols-4">
        <div>
          <dt className="font-display text-4xl font-extrabold tracking-tight text-lime sm:text-5xl">
            {active.length}
          </dt>
          <dd className="mt-1 text-sm text-muted">activos</dd>
        </div>
        <div>
          <dt className="font-display text-4xl font-extrabold tracking-tight text-lime sm:text-5xl">
            {pending.length}
          </dt>
          <dd className="mt-1 text-sm text-muted">en cola</dd>
        </div>
        <div>
          <dt className="font-display text-4xl font-extrabold tracking-tight text-lime sm:text-5xl">
            {healthAlerts}
          </dt>
          <dd className="mt-1 text-sm text-muted">flags de salud</dd>
        </div>
        <div>
          <dt className="font-display text-4xl font-extrabold tracking-tight text-lime sm:text-5xl">
            1:1
          </dt>
          <dd className="mt-1 text-sm text-muted">mensajería</dd>
        </div>
      </dl>

      <section className="mt-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime">
              Activos
            </p>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight">
              Cartera
            </h2>
          </div>
          <p className="max-w-sm text-sm text-paper/70">
            Entra en cada ficha para ver salud, plan y chat.
          </p>
        </div>

        {clients.length === 0 ? (
          <p className="mt-8 rounded-[1.75rem] border border-paper/10 bg-ink-soft px-6 py-10 text-paper/70">
            Todavía no tienes clientes asignados. Revisa la cola pendiente.
          </p>
        ) : (
          <ul className="mt-8 divide-y divide-paper/10 border-y border-paper/10">
            {clients.map(({ assignment, member, profile }, index) => (
              <li key={assignment.id}>
                <Link
                  href={`/trainer/${member.id}`}
                  className="grid gap-3 py-7 touch-manipulation transition-colors active:bg-ink-soft/60 hover:bg-ink-soft/60 sm:grid-cols-[4.5rem_1fr_auto] sm:items-center sm:gap-8 sm:px-2"
                >
                  <span className="font-display text-3xl font-extrabold text-lime">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl font-bold uppercase tracking-tight sm:text-3xl">
                      {member.name ?? member.email}
                    </h3>
                    <p className="mt-1 text-sm text-paper/70">
                      {profile?.goal ?? member.email}
                      {profile?.experience ? ` · ${profile.experience}` : ""}
                    </p>
                    <HealthBadges flags={profile?.healthFlags} />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">
                    {assignment.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-16 rounded-[1.75rem] border border-paper/10 bg-ink-soft p-7 sm:p-9">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime">
              Cola
            </p>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight">
              Pendientes
            </h2>
          </div>
          <p className="max-w-sm text-sm text-paper/70">
            Alumnos del plan humano esperando coach.
          </p>
        </div>

        <ul className="mt-8 space-y-4">
          {pending.length === 0 ? (
            <li className="text-paper/70">No hay alumnos esperando entrenador.</li>
          ) : (
            pending.map(({ assignment, member, profile }) => (
              <li
                key={assignment.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-[1.25rem] border border-paper/10 bg-ink px-5 py-5"
              >
                <div>
                  <p className="font-display text-xl font-bold uppercase tracking-tight">
                    {member.name ?? member.email}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {profile?.goal ?? member.email}
                  </p>
                  <HealthBadges flags={profile?.healthFlags} />
                </div>
                <ClaimClientButton
                  assignmentId={assignment.id}
                  trainerId={user.id}
                />
              </li>
            ))
          )}
        </ul>
      </section>
    </TrainerShell>
  );
}
