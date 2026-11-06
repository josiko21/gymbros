import { randomUUID } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import type {
  Profile,
  Subscription,
  User,
  WorkoutDay,
  WorkoutPlan,
} from "@/lib/db/schema";

export type LocalAssignment = {
  id: string;
  memberId: string;
  trainerId: string | null;
  status: "pending" | "active" | "ended";
  createdAt: Date;
  updatedAt: Date;
};

type Store = {
  users: User[];
  profiles: Profile[];
  subscriptions: Subscription[];
  workoutPlans: WorkoutPlan[];
  assignments: LocalAssignment[];
};

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "local-db.json");

function emptyStore(): Store {
  return {
    users: [],
    profiles: [],
    subscriptions: [],
    workoutPlans: [],
    assignments: [],
  };
}

function readStore(): Store {
  try {
    if (!existsSync(STORE_PATH)) return emptyStore();
    const raw = readFileSync(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Store;
    return {
      users: parsed.users ?? [],
      profiles: parsed.profiles ?? [],
      subscriptions: parsed.subscriptions ?? [],
      workoutPlans: parsed.workoutPlans ?? [],
      assignments: parsed.assignments ?? [],
    };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: Store) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

function reviveDates<T extends { createdAt?: Date | string; updatedAt?: Date | string; currentPeriodEnd?: Date | string | null }>(
  row: T,
): T {
  return {
    ...row,
    ...(row.createdAt ? { createdAt: new Date(row.createdAt) } : {}),
    ...(row.updatedAt ? { updatedAt: new Date(row.updatedAt) } : {}),
    ...(row.currentPeriodEnd != null
      ? { currentPeriodEnd: new Date(row.currentPeriodEnd) }
      : {}),
  };
}

export function isLocalDbEnabled() {
  return !process.env.DATABASE_URL?.trim();
}

export const localDb = {
  findUserByClerkId(clerkId: string) {
    const user = readStore().users.find((u) => u.clerkId === clerkId);
    return user ? reviveDates(user) : null;
  },
  findUserById(id: string) {
    const user = readStore().users.find((u) => u.id === id);
    return user ? reviveDates(user) : null;
  },
  insertUser(input: Omit<User, "id" | "createdAt" | "updatedAt"> & Partial<Pick<User, "id">>) {
    const store = readStore();
    const now = new Date();
    const user: User = {
      id: input.id ?? randomUUID(),
      clerkId: input.clerkId,
      email: input.email,
      name: input.name ?? null,
      role: input.role ?? "member",
      bio: input.bio ?? null,
      specialties: input.specialties ?? null,
      trainerOnboardingComplete: input.trainerOnboardingComplete ?? false,
      stripeCustomerId: input.stripeCustomerId ?? null,
      createdAt: now,
      updatedAt: now,
    };
    store.users.push(user);
    writeStore(store);
    return user;
  },
  updateUser(id: string, patch: Partial<User>) {
    const store = readStore();
    const index = store.users.findIndex((u) => u.id === id);
    if (index < 0) return null;
    const next = {
      ...store.users[index],
      ...patch,
      updatedAt: new Date(),
    } as User;
    store.users[index] = next;
    writeStore(store);
    return reviveDates(next);
  },
  findProfileByUserId(userId: string) {
    const profile = readStore().profiles.find((p) => p.userId === userId);
    return profile ? reviveDates(profile) : null;
  },
  insertProfile(
    input: Partial<Profile> & { userId: string },
  ) {
    const store = readStore();
    const now = new Date();
    const profile: Profile = {
      id: input.id ?? randomUUID(),
      userId: input.userId,
      goal: input.goal ?? null,
      experience: input.experience ?? null,
      daysPerWeek: input.daysPerWeek ?? null,
      sessionMinutes: input.sessionMinutes ?? null,
      equipment: input.equipment ?? [],
      availabilityNotes: input.availabilityNotes ?? null,
      sex: input.sex ?? null,
      birthYear: input.birthYear ?? null,
      heightCm: input.heightCm ?? null,
      weightKg: input.weightKg ?? null,
      hasHealthConditions: input.hasHealthConditions ?? false,
      healthConditions: input.healthConditions ?? null,
      injuries: input.injuries ?? null,
      painAreas: input.painAreas ?? null,
      medications: input.medications ?? null,
      contraindications: input.contraindications ?? null,
      doctorClearance: input.doctorClearance ?? null,
      pregnancyOrPostpartum: input.pregnancyOrPostpartum ?? false,
      healthFlags: input.healthFlags ?? [],
      sleepHours: input.sleepHours ?? null,
      stressLevel: input.stressLevel ?? null,
      activityJob: input.activityJob ?? null,
      notes: input.notes ?? null,
      coachNotes: input.coachNotes ?? null,
      onboardingComplete: input.onboardingComplete ?? false,
      createdAt: now,
      updatedAt: now,
    };
    store.profiles.push(profile);
    writeStore(store);
    return profile;
  },
  updateProfile(userId: string, patch: Partial<Profile>) {
    const store = readStore();
    const index = store.profiles.findIndex((p) => p.userId === userId);
    if (index < 0) return null;
    const next = {
      ...store.profiles[index],
      ...patch,
      updatedAt: new Date(),
    } as Profile;
    store.profiles[index] = next;
    writeStore(store);
    return reviveDates(next);
  },
  findSubscriptionByUserId(userId: string) {
    const sub = readStore().subscriptions.find((s) => s.userId === userId);
    return sub ? reviveDates(sub) : null;
  },
  upsertSubscription(
    input: Partial<Subscription> & {
      userId: string;
      coachingMode: Subscription["coachingMode"];
      status: Subscription["status"];
    },
  ) {
    const store = readStore();
    const index = store.subscriptions.findIndex((s) => s.userId === input.userId);
    const now = new Date();
    if (index >= 0) {
      const next = {
        ...store.subscriptions[index],
        ...input,
        updatedAt: now,
      } as Subscription;
      store.subscriptions[index] = next;
      writeStore(store);
      return reviveDates(next);
    }
    const created: Subscription = {
      id: input.id ?? randomUUID(),
      userId: input.userId,
      stripeSubscriptionId: input.stripeSubscriptionId ?? null,
      stripePriceId: input.stripePriceId ?? null,
      coachingMode: input.coachingMode,
      status: input.status,
      currentPeriodEnd: input.currentPeriodEnd ?? null,
      createdAt: now,
      updatedAt: now,
    };
    store.subscriptions.push(created);
    writeStore(store);
    return created;
  },
  findLatestPlan(userId: string) {
    const plans = readStore()
      .workoutPlans.filter((p) => p.userId === userId)
      .map((p) => reviveDates(p))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return plans[0] ?? null;
  },
  insertPlan(input: {
    userId: string;
    weekStart: string;
    title: string;
    summary: string;
    days: WorkoutDay[];
  }) {
    const store = readStore();
    const now = new Date();
    const plan: WorkoutPlan = {
      id: randomUUID(),
      userId: input.userId,
      weekStart: input.weekStart,
      title: input.title,
      summary: input.summary,
      days: input.days,
      createdAt: now,
    };
    store.workoutPlans.push(plan);
    writeStore(store);
    return plan;
  },
  listTrainerClients(trainerId: string) {
    const store = readStore();
    return store.assignments
      .filter((a) => a.trainerId === trainerId)
      .map((assignment) => {
        const member = store.users.find((u) => u.id === assignment.memberId);
        const profile = store.profiles.find(
          (p) => p.userId === assignment.memberId,
        );
        if (!member) return null;
        return {
          assignment: reviveDates(assignment),
          member: reviveDates(member),
          profile: profile ? reviveDates(profile) : null,
        };
      })
      .filter(Boolean) as {
      assignment: LocalAssignment;
      member: User;
      profile: Profile | null;
    }[];
  },
  listPendingAssignments() {
    const store = readStore();
    return store.assignments
      .filter((a) => a.status === "pending")
      .map((assignment) => {
        const member = store.users.find((u) => u.id === assignment.memberId);
        const profile = store.profiles.find(
          (p) => p.userId === assignment.memberId,
        );
        if (!member) return null;
        return {
          assignment: reviveDates(assignment),
          member: reviveDates(member),
          profile: profile ? reviveDates(profile) : null,
        };
      })
      .filter(Boolean) as {
      assignment: LocalAssignment;
      member: User;
      profile: Profile | null;
    }[];
  },
  claimAssignment(assignmentId: string, trainerId: string) {
    const store = readStore();
    const index = store.assignments.findIndex((a) => a.id === assignmentId);
    if (index < 0) return null;
    const next: LocalAssignment = {
      ...store.assignments[index],
      trainerId,
      status: "active",
      updatedAt: new Date(),
    };
    store.assignments[index] = next;
    writeStore(store);
    return reviveDates(next);
  },
  ensurePendingAssignment(memberId: string) {
    const store = readStore();
    const existing = store.assignments.find(
      (a) =>
        a.memberId === memberId &&
        (a.status === "pending" || a.status === "active"),
    );
    if (existing) return reviveDates(existing);
    const now = new Date();
    const created: LocalAssignment = {
      id: randomUUID(),
      memberId,
      trainerId: null,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    store.assignments.push(created);
    writeStore(store);
    return created;
  },
};

export function buildStarterPlan(daysPerWeek: number): {
  title: string;
  summary: string;
  days: WorkoutDay[];
} {
  const templates: WorkoutDay[] = [
    {
      day: "Día 1",
      focus: "Full body A",
      exercises: [
        { name: "Sentadilla goblet", sets: "3", reps: "8-10" },
        { name: "Press pecho", sets: "3", reps: "8-10" },
        { name: "Remo con mancuerna", sets: "3", reps: "10" },
        { name: "Plancha", sets: "3", reps: "30-40s" },
      ],
    },
    {
      day: "Día 2",
      focus: "Full body B",
      exercises: [
        { name: "Peso muerto rumano", sets: "3", reps: "8-10" },
        { name: "Press militar", sets: "3", reps: "8-10" },
        { name: "Dominadas asistidas / jalón", sets: "3", reps: "6-10" },
        { name: "Farmers walk", sets: "3", reps: "30-40m" },
      ],
    },
    {
      day: "Día 3",
      focus: "Full body C",
      exercises: [
        { name: "Zancadas", sets: "3", reps: "8/pierna" },
        { name: "Fondos / press cerrado", sets: "3", reps: "8-12" },
        { name: "Face pull", sets: "3", reps: "12-15" },
        { name: "Dead bug", sets: "3", reps: "8/lado" },
      ],
    },
    {
      day: "Día 4",
      focus: "Fuerza + core",
      exercises: [
        { name: "Sentadilla frontal / goblet", sets: "4", reps: "6-8" },
        { name: "Press banco / suelo", sets: "4", reps: "6-8" },
        { name: "Remo", sets: "3", reps: "8-10" },
        { name: "Pallof press", sets: "3", reps: "10/lado" },
      ],
    },
    {
      day: "Día 5",
      focus: "Hipertrofia",
      exercises: [
        { name: "Prensa / sentadilla", sets: "3", reps: "10-12" },
        { name: "Elevaciones laterales", sets: "3", reps: "12-15" },
        { name: "Curl bíceps", sets: "3", reps: "10-12" },
        { name: "Extensión tríceps", sets: "3", reps: "10-12" },
      ],
    },
  ];

  const days = templates.slice(0, Math.min(Math.max(daysPerWeek, 1), 5));
  return {
    title: "Plan inicial Gymbros",
    summary:
      "Plan base adaptado a tu nivel. Ajústalo con la IA o tu entrenador cuando completes más datos.",
    days,
  };
}
