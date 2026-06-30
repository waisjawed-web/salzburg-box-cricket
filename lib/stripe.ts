import Stripe from "stripe";

export function getStripeSecretKey() {
  return process.env.STRIPE_SECRET_KEY || process.env.STRIPE_API_KEY || process.env.STRIPE_PRIVATE_KEY || "";
}

export function hasStripeConfig() {
  return Boolean(getStripeSecretKey());
}

export function getStripe() {
  const secretKey = getStripeSecretKey();
  if (!secretKey) {
    throw new Error("Stripe secret key is not configured");
  }

  return new Stripe(secretKey, {
    typescript: true
  });
}
