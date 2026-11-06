import { NextResponse } from "next/server";
import { and, asc, eq, or } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { messages, trainerAssignments } from "@/lib/db/schema";
import { ensureUser } from "@/lib/users";

export async function GET(request: Request) {
  try {
    const user = await ensureUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memberId = new URL(request.url).searchParams.get("memberId");
    const db = getDb();

    if (user.role === "trainer" || user.role === "admin") {
      if (!memberId) {
        return NextResponse.json({ error: "memberId required" }, { status: 400 });
      }
      const assignment = await db.query.trainerAssignments.findFirst({
        where: and(
          eq(trainerAssignments.memberId, memberId),
          or(
            eq(trainerAssignments.trainerId, user.id),
            eq(trainerAssignments.status, "pending"),
          ),
        ),
      });
      if (!assignment && user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const rows = await db
        .select()
        .from(messages)
        .where(eq(messages.userId, memberId))
        .orderBy(asc(messages.createdAt));
      return NextResponse.json({ messages: rows });
    }

    const rows = await db
      .select()
      .from(messages)
      .where(eq(messages.userId, user.id))
      .orderBy(asc(messages.createdAt));
    return NextResponse.json({ messages: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

const postSchema = z.object({
  content: z.string().min(1).max(4000),
  memberId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await ensureUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = postSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const db = getDb();

    if (user.role === "trainer" || user.role === "admin") {
      const memberId = parsed.data.memberId;
      if (!memberId) {
        return NextResponse.json({ error: "memberId required" }, { status: 400 });
      }
      const [row] = await db
        .insert(messages)
        .values({
          userId: memberId,
          sender: "trainer",
          content: parsed.data.content,
        })
        .returning();
      return NextResponse.json({ message: row });
    }

    const [row] = await db
      .insert(messages)
      .values({
        userId: user.id,
        sender: "user",
        content: parsed.data.content,
      })
      .returning();
    return NextResponse.json({ message: row });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
