import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      message: "Stripe Checkout will be enabled in phase two.",
      nextSteps: [
        "Create a pending Booking record",
        "Create a Stripe Checkout Session",
        "Redirect the customer to session.url",
        "Mark payment and booking as paid from the Stripe webhook"
      ]
    },
    { status: 501 }
  );
}
