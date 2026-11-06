import Stripe from "stripe";

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(key);
}

export function getPriceId(plan: "ai" | "human") {
  const priceId =
    plan === "ai" ? process.env.STRIPE_PRICE_AI : process.env.STRIPE_PRICE_HUMAN;
  if (!priceId) {
    throw new Error(
      plan === "ai" ? "STRIPE_PRICE_AI is not set" : "STRIPE_PRICE_HUMAN is not set",
    );
  }
  return priceId;
}

export function planFromPriceId(priceId: string | null | undefined): "ai" | "human" {
  if (priceId && priceId === process.env.STRIPE_PRICE_HUMAN) return "human";
  return "ai";
}
