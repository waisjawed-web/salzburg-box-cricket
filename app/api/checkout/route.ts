import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { courts, slots } from "@/lib/data";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";
import { getStripe, hasStripeConfig } from "@/lib/stripe";

const checkoutSchema = z.object({
  courtId: z.string(),
  date: z.string(),
  time: z.string()
});

function getRequestOrigin(request: NextRequest) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");

  const origin = request.headers.get("origin");
  if (origin) return origin;

  const host = request.headers.get("host") || "salzburgboxcricket.com";
  return `https://${host}`;
}

export async function POST(request: NextRequest) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "Database is not connected yet." }, { status: 503 });
  }

  if (!hasStripeConfig()) {
    return NextResponse.json({
      error: "Stripe is not connected yet. Add STRIPE_SECRET_KEY in Vercel, then redeploy."
    }, { status: 503 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please login or create an account before checkout." }, { status: 401 });
  }

  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const selectedCourt = courts.find((court) => court.id === parsed.data.courtId);
  const selectedSlot = slots.find((slot) => slot.courtId === parsed.data.courtId && slot.time === parsed.data.time);

  if (!selectedCourt || !selectedSlot) {
    return NextResponse.json({ error: "Court or slot not found." }, { status: 404 });
  }

  if (!selectedSlot.available) {
    return NextResponse.json({ error: "That slot is unavailable." }, { status: 409 });
  }

  const [startHour] = selectedSlot.time.split(":");
  const startsAt = new Date(`${parsed.data.date}T${startHour.padStart(2, "0")}:00:00.000Z`);
  const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);

  const existingBooking = await prisma.booking.findFirst({
    where: {
      courtId: selectedCourt.id,
      startsAt,
      status: { in: ["PENDING", "PAID", "APPROVED"] }
    }
  });

  if (existingBooking) {
    return NextResponse.json({ error: "That slot has just been booked. Please choose another time." }, { status: 409 });
  }

  const totalCents = Math.round(selectedSlot.price * 100);
  const origin = getRequestOrigin(request);

  const court = await prisma.court.upsert({
    where: { id: selectedCourt.id },
    update: {
      name: selectedCourt.name,
      description: selectedCourt.description,
      hourlyRate: selectedCourt.hourlyRate * 100
    },
    create: {
      id: selectedCourt.id,
      name: selectedCourt.name,
      description: selectedCourt.description,
      hourlyRate: selectedCourt.hourlyRate * 100
    }
  });

  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      courtId: court.id,
      startsAt,
      endsAt,
      totalCents,
      status: "PENDING",
      payment: {
        create: {
          userId: user.id,
          amountCents: totalCents,
          status: "PENDING",
          provider: "stripe"
        }
      }
    },
    include: { payment: true }
  });

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: `${selectedCourt.name} booking`,
            description: `${parsed.data.date}, ${selectedSlot.label}`
          },
          unit_amount: totalCents
        },
        quantity: 1
      }
    ],
    metadata: {
      bookingId: booking.id,
      userId: user.id
    },
    success_url: `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/booking/cancel?booking_id=${booking.id}`
  });

  await prisma.payment.update({
    where: { bookingId: booking.id },
    data: { providerSessionId: session.id }
  });

  return NextResponse.json({ url: session.url });
}
