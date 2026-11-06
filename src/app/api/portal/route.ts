import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { ensureUser } from "@/lib/users";

export async function POST(request: Request) {
  try {
    const user = await ensureUser();
    if (!user?.stripeCustomerId) {
      return NextResponse.json({ error: "No Stripe customer" }, { status: 400 });
    }

    const stripe = getStripe();
    const origin = new URL(request.url).origin;
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${origin}/app`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Portal failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
