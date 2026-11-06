import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { isLocalDbEnabled, localDb } from "@/lib/db/local-store";
import { subscriptions, users } from "@/lib/db/schema";
import { getPriceId, getStripe } from "@/lib/stripe";
import { ensureUser } from "@/lib/users";

function isStripeConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() &&
      process.env.STRIPE_PRICE_AI?.trim() &&
      process.env.STRIPE_PRICE_HUMAN?.trim(),
  );
}

export async function POST(request: Request) {
  try {
    const user = await ensureUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as { plan?: string };
    const plan = body.plan === "human" ? "human" : "ai";
    const origin = new URL(request.url).origin;

    // Sin Stripe o sin Neon: activa trial local para poder usar la app.
    if (!isStripeConfigured() || isLocalDbEnabled()) {
      if (isLocalDbEnabled()) {
        localDb.upsertSubscription({
          userId: user.id,
          coachingMode: plan,
          status: "trialing",
          currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        });
        if (plan === "human") {
          localDb.ensurePendingAssignment(user.id);
        }
      } else {
        const db = getDb();
        const existing = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.userId, user.id),
        });
        if (!existing) {
          await db.insert(subscriptions).values({
            userId: user.id,
            coachingMode: plan,
            status: "trialing",
            currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          });
        } else {
          await db
            .update(subscriptions)
            .set({
              coachingMode: plan,
              status: "trialing",
              currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.id, existing.id));
        }
      }

      return NextResponse.json({
        url: `${origin}/app/onboarding?checkout=success`,
        demo: true,
      });
    }

    const stripe = getStripe();
    const db = getDb();

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { clerkId: user.clerkId, userId: user.id },
      });
      customerId = customer.id;
      await db
        .update(users)
        .set({ stripeCustomerId: customerId, updatedAt: new Date() })
        .where(eq(users.id, user.id));
    }

    const existing = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, user.id),
    });

    if (!existing) {
      await db.insert(subscriptions).values({
        userId: user.id,
        coachingMode: plan,
        status: "inactive",
      });
    } else {
      await db
        .update(subscriptions)
        .set({ coachingMode: plan, updatedAt: new Date() })
        .where(eq(subscriptions.id, existing.id));
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: getPriceId(plan), quantity: 1 }],
      success_url: `${origin}/app/onboarding?checkout=success`,
      cancel_url: `${origin}/checkout?plan=${plan}&canceled=1`,
      metadata: {
        userId: user.id,
        coachingMode: plan,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          coachingMode: plan,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
