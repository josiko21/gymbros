import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { isLocalDbEnabled, localDb } from "@/lib/db/local-store";
import { profiles, subscriptions, users, type Profile, type Subscription, type User } from "@/lib/db/schema";
import { normalizeLevel } from "@/lib/member-profile";

function resolveRole(clerkUser: {
  id: string;
  unsafeMetadata?: Record<string, unknown> | null;
  publicMetadata?: Record<string, unknown> | null;
}) {
  const adminIds = (process.env.ADMIN_CLERK_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (adminIds.includes(clerkUser.id)) return "admin" as const;

  const metaRole =
    (clerkUser.unsafeMetadata?.role as string | undefined) ??
    (clerkUser.publicMetadata?.role as string | undefined);

  if (metaRole === "trainer") return "trainer" as const;
  return "member" as const;
}

function resolveExperience(clerkUser: {
  unsafeMetadata?: Record<string, unknown> | null;
  publicMetadata?: Record<string, unknown> | null;
}) {
  const raw =
    (clerkUser.unsafeMetadata?.experience as string | undefined) ??
    (clerkUser.publicMetadata?.experience as string | undefined) ??
    (clerkUser.unsafeMetadata?.level as string | undefined);
  return normalizeLevel(raw);
}

async function ensureUserLocal(clerkUser: NonNullable<Awaited<ReturnType<typeof currentUser>>>) {
  const email =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    "";

  const role = resolveRole(clerkUser);
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;
  const experience = resolveExperience(clerkUser);

  const existing = localDb.findUserByClerkId(clerkUser.id);
  if (existing) {
    let user: User = existing;
    if (
      existing.role !== "admin" &&
      role === "trainer" &&
      existing.role !== "trainer"
    ) {
      user =
        localDb.updateUser(existing.id, {
          role: "trainer",
          name: name ?? existing.name,
        }) ?? existing;
    }

    if (user.role === "member" || user.role === "admin") {
      const profile = localDb.findProfileByUserId(user.id);
      if (profile && !profile.experience && experience) {
        localDb.updateProfile(user.id, { experience });
      }
    }
    return user;
  }

  const created = localDb.insertUser({
    clerkId: clerkUser.id,
    email,
    name,
    role,
    bio: null,
    specialties: null,
    trainerOnboardingComplete: false,
    stripeCustomerId: null,
  });

  if (role === "member" || role === "admin") {
    localDb.insertProfile({
      userId: created.id,
      ...(experience ? { experience } : {}),
    });
  }

  return created;
}

export async function ensureUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  if (isLocalDbEnabled()) {
    return ensureUserLocal(clerkUser);
  }

  const db = getDb();
  const email =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    "";

  const existing = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkUser.id),
  });

  const role = resolveRole(clerkUser);
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

  if (existing) {
    if (
      existing.role !== "admin" &&
      role === "trainer" &&
      existing.role !== "trainer"
    ) {
      const [updated] = await db
        .update(users)
        .set({ role: "trainer", name: name ?? existing.name, updatedAt: new Date() })
        .where(eq(users.id, existing.id))
        .returning();
      return updated;
    }

    if (existing.role === "member" || existing.role === "admin") {
      const experience = resolveExperience(clerkUser);
      if (experience) {
        const profile = await db.query.profiles.findFirst({
          where: eq(profiles.userId, existing.id),
        });
        if (profile && !profile.experience) {
          await db
            .update(profiles)
            .set({ experience, updatedAt: new Date() })
            .where(eq(profiles.userId, existing.id));
        }
      }
    }

    return existing;
  }

  const [created] = await db
    .insert(users)
    .values({
      clerkId: clerkUser.id,
      email,
      name,
      role,
    })
    .returning();

  if (role === "member" || role === "admin") {
    const experience = resolveExperience(clerkUser);
    await db.insert(profiles).values({
      userId: created.id,
      ...(experience ? { experience } : {}),
    });
  }

  return created;
}

export async function getUserContext(): Promise<{
  user: User;
  profile: Profile | null | undefined;
  subscription: Subscription | null | undefined;
} | null> {
  const user = await ensureUser();
  if (!user) return null;

  if (isLocalDbEnabled()) {
    return {
      user,
      profile: localDb.findProfileByUserId(user.id),
      subscription: localDb.findSubscriptionByUserId(user.id),
    };
  }

  const db = getDb();
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, user.id),
  });
  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, user.id),
  });

  return { user, profile, subscription };
}

export function hasActiveSubscription(
  subscription: Subscription | null | undefined,
) {
  if (!subscription) return false;
  return subscription.status === "active" || subscription.status === "trialing";
}

export function homePathForRole(role: string) {
  if (role === "trainer") return "/trainer";
  if (role === "admin") return "/admin";
  return "/app";
}
