import { NextResponse } from "next/server";
import Stripe from "stripe";
import { sendBookingConfirmationEmail } from "@/lib/email";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";
import { getStripe, hasStripeConfig } from "@/lib/stripe";

export const dynamic = "force-dynamic";

function formatBookingTime(startsAt: Date, endsAt: Date) {
  return `${startsAt.toISOString().slice(11, 16)} - ${endsAt.toISOString().slice(11, 16)}`;
}

async function markBookingPaid(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) return;

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "PAID",
      payment: {
        update: {
          status: "PAID",
          providerSessionId: session.id,
          providerPaymentIntent: typeof session.payment_intent === "string" ? session.payment_intent : undefined
        }
      }
    },
    include: { court: true, user: true }
  });

  await sendBookingConfirmationEmail({
    to: booking.user.email,
    customerName: booking.user.name,
    bookingId: booking.id,
    courtName: booking.court.name,
    date: booking.startsAt.toISOString().slice(0, 10),
    time: formatBookingTime(booking.startsAt, booking.endsAt),
    amountCents: booking.totalCents
  });
}

async function markBookingFailed(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) return;

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CANCELLED",
      payment: {
        update: {
          status: "FAILED",
          providerSessionId: session.id
        }
      }
    }
  });
}

export async function POST(request: Request) {
  if (!hasDatabaseUrl() || !hasStripeConfig() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 503 });
  }

  const stripe = getStripe();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid Stripe signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    await markBookingPaid(event.data.object as Stripe.Checkout.Session);
  }

  if (event.type === "checkout.session.expired") {
    await markBookingFailed(event.data.object as Stripe.Checkout.Session);
  }

  return NextResponse.json({ received: true });
}
