import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { checkIns } from "@/lib/db/schema";
import { ensureUser, hasActiveSubscription, getUserContext } from "@/lib/users";

const schema = z.object({
  note: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await ensureUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const ctx = await getUserContext();
    if (!hasActiveSubscription(ctx?.subscription)) {
      return NextResponse.json({ error: "Subscription required" }, { status: 402 });
    }

    const parsed = schema.safeParse(await request.json().catch(() => ({})));
    const date = new Date().toISOString().slice(0, 10);
    const db = getDb();

    const existing = await db.query.checkIns.findFirst({
      where: and(eq(checkIns.userId, user.id), eq(checkIns.date, date)),
    });

    if (existing) {
      return NextResponse.json({ ok: true, checkIn: existing });
    }

    const [created] = await db
      .insert(checkIns)
      .values({
        userId: user.id,
        date,
        completed: true,
        note: parsed.success ? parsed.data.note ?? null : null,
      })
      .returning();

    return NextResponse.json({ ok: true, checkIn: created });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Check-in failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
