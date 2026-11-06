import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { isLocalDbEnabled, localDb } from "@/lib/db/local-store";
import { trainerAssignments, users } from "@/lib/db/schema";
import { ensureUser } from "@/lib/users";

export async function GET() {
  try {
    const user = await ensureUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isLocalDbEnabled()) {
      if (user.role === "trainer") {
        return NextResponse.json({
          clients: localDb.listTrainerClients(user.id),
        });
      }
      if (user.role === "admin") {
        return NextResponse.json({
          pending: localDb.listPendingAssignments(),
          trainers: [],
        });
      }
      return NextResponse.json({ assignment: null });
    }

    const db = getDb();

    if (user.role === "admin") {
      const pending = await db
        .select({
          assignment: trainerAssignments,
          member: users,
        })
        .from(trainerAssignments)
        .innerJoin(users, eq(trainerAssignments.memberId, users.id))
        .where(eq(trainerAssignments.status, "pending"));

      const trainers = await db
        .select()
        .from(users)
        .where(eq(users.role, "trainer"));

      return NextResponse.json({ pending, trainers });
    }

    if (user.role === "trainer") {
      const clients = await db
        .select({
          assignment: trainerAssignments,
          member: users,
        })
        .from(trainerAssignments)
        .innerJoin(users, eq(trainerAssignments.memberId, users.id))
        .where(eq(trainerAssignments.trainerId, user.id));

      return NextResponse.json({ clients });
    }

    const assignment = await db.query.trainerAssignments.findFirst({
      where: eq(trainerAssignments.memberId, user.id),
    });
    return NextResponse.json({ assignment });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

const assignSchema = z.object({
  assignmentId: z.string().uuid(),
  trainerId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const user = await ensureUser();
    if (!user || (user.role !== "admin" && user.role !== "trainer")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const parsed = assignSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const trainerId =
      user.role === "trainer" ? user.id : parsed.data.trainerId;

    if (isLocalDbEnabled()) {
      const updated = localDb.claimAssignment(
        parsed.data.assignmentId,
        trainerId,
      );
      return NextResponse.json({ assignment: updated });
    }

    const db = getDb();
    const [updated] = await db
      .update(trainerAssignments)
      .set({
        trainerId,
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(trainerAssignments.id, parsed.data.assignmentId))
      .returning();

    return NextResponse.json({ assignment: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
