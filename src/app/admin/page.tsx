import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AssignTrainerForm } from "@/components/AssignTrainerForm";
import { getDb } from "@/lib/db";
import { trainerAssignments, users } from "@/lib/db/schema";
import { ensureUser } from "@/lib/users";

export default async function AdminPage() {
  const user = await ensureUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "admin") redirect("/app");

  const db = getDb();
  const pending = await db
    .select({
      assignment: trainerAssignments,
      member: users,
    })
    .from(trainerAssignments)
    .innerJoin(users, eq(trainerAssignments.memberId, users.id))
    .where(eq(trainerAssignments.status, "pending"));

  const trainers = await db.select().from(users).where(eq(users.role, "trainer"));

  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <p className="text-xs uppercase tracking-[0.22em] text-lime">Admin</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold uppercase">
        Asignar entrenadores
      </h1>
      <p className="mt-3 text-sm text-muted">
        Para crear un trainer, pon role=&quot;trainer&quot; en la tabla users (mismo
        Clerk id). Admins: ADMIN_CLERK_IDS en .env.
      </p>

      <ul className="mt-10 space-y-4">
        {pending.length === 0 ? (
          <li className="text-paper/70">No hay asignaciones pendientes.</li>
        ) : (
          pending.map(({ assignment, member }) => (
            <li
              key={assignment.id}
              className="rounded-[1.25rem] border border-paper/10 bg-ink-soft p-5"
            >
              <p className="font-semibold">{member.name ?? member.email}</p>
              <p className="text-sm text-muted">{member.email}</p>
              <div className="mt-4">
                <AssignTrainerForm
                  assignmentId={assignment.id}
                  trainers={trainers.map((t) => ({
                    id: t.id,
                    label: t.name ?? t.email,
                  }))}
                />
              </div>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
