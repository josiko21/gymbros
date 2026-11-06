import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const coachingModeEnum = pgEnum("coaching_mode", ["ai", "human"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "inactive",
  "active",
  "past_due",
  "canceled",
  "trialing",
]);
export const assignmentStatusEnum = pgEnum("assignment_status", [
  "pending",
  "active",
  "ended",
]);
export const messageSenderEnum = pgEnum("message_sender", [
  "user",
  "trainer",
  "ai",
  "system",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name"),
  role: text("role").notNull().default("member"), // member | trainer | admin
  bio: text("bio"),
  specialties: text("specialties"),
  trainerOnboardingComplete: boolean("trainer_onboarding_complete")
    .notNull()
    .default(false),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripePriceId: text("stripe_price_id"),
  coachingMode: coachingModeEnum("coaching_mode").notNull(),
  status: subscriptionStatusEnum("status").notNull().default("inactive"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  // Entrenamiento
  goal: text("goal"),
  experience: text("experience"),
  daysPerWeek: integer("days_per_week"),
  sessionMinutes: integer("session_minutes"),
  equipment: jsonb("equipment").$type<string[]>().notNull().default([]),
  availabilityNotes: text("availability_notes"),
  // Antropometría / demografía
  sex: text("sex"),
  birthYear: integer("birth_year"),
  heightCm: integer("height_cm"),
  weightKg: integer("weight_kg"),
  // Salud (crítico para IA y coaches)
  hasHealthConditions: boolean("has_health_conditions").notNull().default(false),
  healthConditions: text("health_conditions"),
  injuries: text("injuries"),
  painAreas: text("pain_areas"),
  medications: text("medications"),
  contraindications: text("contraindications"),
  doctorClearance: boolean("doctor_clearance"),
  pregnancyOrPostpartum: boolean("pregnancy_or_postpartum")
    .notNull()
    .default(false),
  healthFlags: jsonb("health_flags").$type<string[]>().notNull().default([]),
  // Estilo de vida
  sleepHours: integer("sleep_hours"),
  stressLevel: text("stress_level"),
  activityJob: text("activity_job"),
  // Notas
  notes: text("notes"),
  coachNotes: text("coach_notes"),
  onboardingComplete: boolean("onboarding_complete").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const trainerAssignments = pgTable("trainer_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  trainerId: uuid("trainer_id").references(() => users.id, {
    onDelete: "set null",
  }),
  status: assignmentStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sender: messageSenderEnum("sender").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const workoutPlans = pgTable("workout_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  weekStart: text("week_start").notNull(),
  title: text("title").notNull(),
  summary: text("summary"),
  days: jsonb("days").$type<WorkoutDay[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const checkIns = pgTable("check_ins", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  completed: boolean("completed").notNull().default(true),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const exerciseLogs = pgTable("exercise_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  planId: uuid("plan_id").references(() => workoutPlans.id, {
    onDelete: "set null",
  }),
  date: text("date").notNull(),
  dayLabel: text("day_label").notNull(),
  exerciseName: text("exercise_name").notNull(),
  completed: boolean("completed").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  subscription: one(subscriptions, {
    fields: [users.id],
    references: [subscriptions.userId],
  }),
  messages: many(messages),
  plans: many(workoutPlans),
  exerciseLogs: many(exerciseLogs),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const workoutPlansRelations = relations(workoutPlans, ({ one }) => ({
  user: one(users, {
    fields: [workoutPlans.userId],
    references: [users.id],
  }),
}));

export const checkInsRelations = relations(checkIns, ({ one }) => ({
  user: one(users, {
    fields: [checkIns.userId],
    references: [users.id],
  }),
}));

export const trainerAssignmentsRelations = relations(
  trainerAssignments,
  ({ one }) => ({
    member: one(users, {
      fields: [trainerAssignments.memberId],
      references: [users.id],
    }),
  }),
);

export const exerciseLogsRelations = relations(exerciseLogs, ({ one }) => ({
  user: one(users, {
    fields: [exerciseLogs.userId],
    references: [users.id],
  }),
}));

export type WorkoutExercise = {
  name: string;
  sets: string;
  reps: string;
  notes?: string;
};

export type WorkoutDay = {
  day: string;
  focus: string;
  exercises: WorkoutExercise[];
};

export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type Message = typeof messages.$inferSelect;
