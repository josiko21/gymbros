CREATE TYPE "public"."coaching_mode" AS ENUM('ai', 'human');
CREATE TYPE "public"."subscription_status" AS ENUM('inactive', 'active', 'past_due', 'canceled', 'trialing');
CREATE TYPE "public"."assignment_status" AS ENUM('pending', 'active', 'ended');
CREATE TYPE "public"."message_sender" AS ENUM('user', 'trainer', 'ai', 'system');

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clerk_id" text NOT NULL UNIQUE,
  "email" text NOT NULL,
  "name" text,
  "role" text DEFAULT 'member' NOT NULL,
  "stripe_customer_id" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE "subscriptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "stripe_subscription_id" text UNIQUE,
  "stripe_price_id" text,
  "coaching_mode" "coaching_mode" NOT NULL,
  "status" "subscription_status" DEFAULT 'inactive' NOT NULL,
  "current_period_end" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE "profiles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE cascade,
  "goal" text,
  "experience" text,
  "days_per_week" integer,
  "notes" text,
  "onboarding_complete" boolean DEFAULT false NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE "trainer_assignments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "member_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "trainer_id" uuid REFERENCES "users"("id") ON DELETE set null,
  "status" "assignment_status" DEFAULT 'pending' NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE "messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "sender" "message_sender" NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE "workout_plans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "week_start" text NOT NULL,
  "title" text NOT NULL,
  "summary" text,
  "days" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE "check_ins" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "date" text NOT NULL,
  "completed" boolean DEFAULT true NOT NULL,
  "note" text,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
