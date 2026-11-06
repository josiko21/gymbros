import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { getDb } from "@/lib/db";
import { subscriptions, trainerAssignments, users } from "@/lib/db/schema";
import { getStripe, planFromPriceId } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json({ error: "Webhook misconfigured" }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const db = getDb();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const mode =
          (session.metadata?.coachingMode as "ai" | "human" | undefined) ?? "ai";
        if (!userId || !session.subscription) break;

        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;
        const sub = await stripe.subscriptions.retrieve(subId);
        const priceId = sub.items.data[0]?.price.id;
        const coachingMode = mode || planFromPriceId(priceId);

        await upsertSubscription(db, {
          userId,
          stripeSubscriptionId: sub.id,
          stripePriceId: priceId,
          coachingMode,
          status: mapStatus(sub.status),
          currentPeriodEnd: periodEnd(sub),
        });

        if (coachingMode === "human") {
          const existing = await db.query.trainerAssignments.findFirst({
            where: eq(trainerAssignments.memberId, userId),
          });
          if (!existing) {
            await db.insert(trainerAssignments).values({
              memberId: userId,
              status: "pending",
            });
          }
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId =
          sub.metadata?.userId ??
          (
            await db.query.users.findFirst({
              where: eq(users.stripeCustomerId, String(sub.customer)),
            })
          )?.id;

        if (!userId) break;

        const priceId = sub.items.data[0]?.price.id;
        await upsertSubscription(db, {
          userId,
          stripeSubscriptionId: sub.id,
          stripePriceId: priceId,
          coachingMode:
            (sub.metadata?.coachingMode as "ai" | "human" | undefined) ??
            planFromPriceId(priceId),
          status: mapStatus(sub.status),
          currentPeriodEnd: periodEnd(sub),
        });
        break;
      }
      default:
        break;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook handler failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function periodEnd(sub: Stripe.Subscription) {
  const end = sub.items.data[0]?.current_period_end;
  return end ? new Date(end * 1000) : new Date();
}

function mapStatus(
  status: Stripe.Subscription.Status,
): "inactive" | "active" | "past_due" | "canceled" | "trialing" {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
      return "canceled";
    default:
      return "inactive";
  }
}

async function upsertSubscription(
  db: ReturnType<typeof getDb>,
  data: {
    userId: string;
    stripeSubscriptionId: string;
    stripePriceId?: string;
    coachingMode: "ai" | "human";
    status: "inactive" | "active" | "past_due" | "canceled" | "trialing";
    currentPeriodEnd: Date;
  },
) {
  const existing = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, data.userId),
  });

  if (existing) {
    await db
      .update(subscriptions)
      .set({
        stripeSubscriptionId: data.stripeSubscriptionId,
        stripePriceId: data.stripePriceId,
        coachingMode: data.coachingMode,
        status: data.status,
        currentPeriodEnd: data.currentPeriodEnd,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, existing.id));
  } else {
    await db.insert(subscriptions).values({
      userId: data.userId,
      stripeSubscriptionId: data.stripeSubscriptionId,
      stripePriceId: data.stripePriceId,
      coachingMode: data.coachingMode,
      status: data.status,
      currentPeriodEnd: data.currentPeriodEnd,
    });
  }
}
