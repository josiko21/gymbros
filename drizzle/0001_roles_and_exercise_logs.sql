ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bio" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "specialties" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "trainer_onboarding_complete" boolean DEFAULT false NOT NULL;

CREATE TABLE IF NOT EXISTS "exercise_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "plan_id" uuid REFERENCES "workout_plans"("id") ON DELETE set null,
  "date" text NOT NULL,
  "day_label" text NOT NULL,
  "exercise_name" text NOT NULL,
  "completed" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
