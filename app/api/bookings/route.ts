import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { sendBookingConfirmationEmail } from "@/lib/email";
import { bookings, courts, slots } from "@/lib/data";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";

const bookingSchema = z.object({
  courtId: z.string(),
  date: z.string(),
  time: z.string(),
  userEmail: z.string().email().optional(),
  amount: z.number().positive()
});

function getSlotDate(date: string, time: string) {
  const [startHour] = time.split(":");
  const startsAt = new Date(`${date}T${startHour.padStart(2, "0")}:00:00.000Z`);
  const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);
  return { startsAt, endsAt };
}

function getDateRange(date: string) {
  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

function formatBookingTime(startsAt: Date, endsAt: Date) {
  return `${startsAt.toISOString().slice(11, 16)} - ${endsAt.toISOString().slice(11, 16)}`;
}

async function getAvailability(date: string, courtId: string) {
  const courtSlots = slots.filter((slot) => slot.courtId === courtId);
  if (!hasDatabaseUrl()) {
    return courtSlots;
  }

  const { start, end } = getDateRange(date);
  const savedBookings = await prisma.booking.findMany({
    where: {
      courtId,
      startsAt: { gte: start, lt: end },
      status: { in: ["PENDING", "PAID", "APPROVED"] }
    },
    select: { startsAt: true }
  });

  const bookedTimes = new Set(savedBookings.map((booking) => booking.startsAt.toISOString().slice(11, 16)));
  return courtSlots.map((slot) => ({
    ...slot,
    available: slot.available && !bookedTimes.has(slot.time)
  }));
}

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  const courtId = request.nextUrl.searchParams.get("courtId");

  if (date && courtId) {
    return NextResponse.json({ slots: await getAvailability(date, courtId) });
  }

  const user = await getCurrentUser();
  if (hasDatabaseUrl() && user) {
    const savedBookings = await prisma.booking.findMany({
      where: user.role === "ADMIN" ? undefined : { userId: user.id },
      include: { court: true, user: true },
      orderBy: { startsAt: "desc" },
      take: 30
    });

    return NextResponse.json({
      bookings: savedBookings.map((booking) => ({
        id: booking.id,
        customerName: booking.user.name,
        customerEmail: booking.user.email,
        courtName: booking.court.name,
        date: booking.startsAt.toISOString().slice(0, 10),
        time: `${booking.startsAt.toISOString().slice(11, 16)} - ${booking.endsAt.toISOString().slice(11, 16)}`,
        status: booking.status,
        amount: booking.totalCents / 100
      }))
    });
  }

  return NextResponse.json({ bookings });
}

export async function POST(request: Request) {
  const parsed = bookingSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in or create an account before booking." }, { status: 401 });
  }

  const selectedCourt = courts.find((court) => court.id === parsed.data.courtId);
  if (!selectedCourt) {
    return NextResponse.json({ error: "Court not found" }, { status: 404 });
  }

  const selectedSlot = slots.find((slot) => slot.courtId === parsed.data.courtId && slot.time === parsed.data.time);
  if (!selectedSlot || !selectedSlot.available) {
    return NextResponse.json({ error: "This slot is not available." }, { status: 409 });
  }

  const { startsAt, endsAt } = getSlotDate(parsed.data.date, parsed.data.time);

  if (hasDatabaseUrl()) {
    const existingBooking = await prisma.booking.findFirst({
      where: {
        courtId: selectedCourt.id,
        startsAt,
        status: { in: ["PENDING", "PAID", "APPROVED"] }
      }
    });

    if (existingBooking) {
      return NextResponse.json({ error: "This slot has just been booked. Please choose another time." }, { status: 409 });
    }

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
        totalCents: Math.round(parsed.data.amount * 100),
        status: "APPROVED",
        payment: {
          create: {
            userId: user.id,
            amountCents: Math.round(parsed.data.amount * 100),
            status: "PENDING",
            provider: "manual",
            providerSessionId: `manual_reservation_${Date.now()}`
          }
        }
      },
      include: { court: true, user: true }
    });

    const emailResult = await sendBookingConfirmationEmail({
      to: booking.user.email,
      customerName: booking.user.name,
      bookingId: booking.id,
      courtName: booking.court.name,
      date: parsed.data.date,
      time: formatBookingTime(booking.startsAt, booking.endsAt),
      amountCents: booking.totalCents,
      paymentLabel: "Pay at venue"
    });

    return NextResponse.json({
      booking: {
        id: booking.id,
        courtName: booking.court.name,
        date: parsed.data.date,
        time: parsed.data.time,
        amount: booking.totalCents / 100,
        status: booking.status
      },
      emailQueued: !emailResult.skipped && !emailResult.error,
      paymentMode: "manual",
      message: "Booking reserved. Please pay at the venue."
    }, { status: 201 });
  }

  return NextResponse.json({
    booking: { id: `MVP-${Date.now().toString().slice(-6)}`, ...parsed.data, status: "APPROVED" },
    emailQueued: false,
    paymentMode: "fake",
    message: "Booking reserved. Please pay at the venue."
  }, { status: 201 });
}
