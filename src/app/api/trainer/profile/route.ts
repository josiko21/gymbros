import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { isLocalDbEnabled, localDb } from "@/lib/db/local-store";
import { users } from "@/lib/db/schema";
import { ensureUser } from "@/lib/users";

const schema = z.object({
  name: z.string().min(2),
  bio: z.string().min(10),
  specialties: z.string().min(2),
});

export async function POST(request: Request) {
  try {
    const user = await ensureUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "trainer" && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    if (isLocalDbEnabled()) {
      const updated = localDb.updateUser(user.id, {
        name: parsed.data.name,
        bio: parsed.data.bio,
        specialties: parsed.data.specialties,
        trainerOnboardingComplete: true,
      });
      return NextResponse.json({ user: updated });
    }

    const db = getDb();
    const [updated] = await db
      .update(users)
      .set({
        name: parsed.data.name,
        bio: parsed.data.bio,
        specialties: parsed.data.specialties,
        trainerOnboardingComplete: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    return NextResponse.json({ user: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
