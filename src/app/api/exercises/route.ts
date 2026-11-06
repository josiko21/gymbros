import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { exerciseLogs } from "@/lib/db/schema";
import { ensureUser, getUserContext, hasActiveSubscription } from "@/lib/users";

export async function GET(request: Request) {
  try {
    const user = await ensureUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const date =
      new URL(request.url).searchParams.get("date") ??
      new Date().toISOString().slice(0, 10);

    const db = getDb();
    const logs = await db
      .select()
      .from(exerciseLogs)
      .where(and(eq(exerciseLogs.userId, user.id), eq(exerciseLogs.date, date)));

    return NextResponse.json({ logs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

const postSchema = z.object({
  planId: z.string().uuid().optional().nullable(),
  dayLabel: z.string().min(1),
  exerciseName: z.string().min(1),
  completed: z.boolean().default(true),
  date: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await ensureUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ctx = await getUserContext();
    if (!hasActiveSubscription(ctx?.subscription) && user.role === "member") {
      return NextResponse.json({ error: "Subscription required" }, { status: 402 });
    }

    const parsed = postSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const date = parsed.data.date ?? new Date().toISOString().slice(0, 10);
    const db = getDb();

    const existing = await db.query.exerciseLogs.findFirst({
      where: and(
        eq(exerciseLogs.userId, user.id),
        eq(exerciseLogs.date, date),
        eq(exerciseLogs.exerciseName, parsed.data.exerciseName),
        eq(exerciseLogs.dayLabel, parsed.data.dayLabel),
      ),
    });

    if (existing) {
      if (!parsed.data.completed) {
        await db.delete(exerciseLogs).where(eq(exerciseLogs.id, existing.id));
        return NextResponse.json({ ok: true, completed: false });
      }
      return NextResponse.json({ ok: true, log: existing, completed: true });
    }

    if (!parsed.data.completed) {
      return NextResponse.json({ ok: true, completed: false });
    }

    const [log] = await db
      .insert(exerciseLogs)
      .values({
        userId: user.id,
        planId: parsed.data.planId ?? null,
        date,
        dayLabel: parsed.data.dayLabel,
        exerciseName: parsed.data.exerciseName,
        completed: true,
      })
      .returning();

    return NextResponse.json({ ok: true, log, completed: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
