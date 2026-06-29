import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { bookings } from "@/lib/data";
import { courts } from "@/lib/data";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";

const bookingSchema = z.object({
  courtId: z.string(),
  date: z.string(),
  time: z.string(),
  userEmail: z.string().email().optional(),
  amount: z.number().positive()
});

export async function GET() {
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
  if (!parsed.success) return NextResponse.json({ error: "Invalid booking payload", issues: parsed.error.flatten() }, { status: 400 });

  const user = await getCurrentUser();
  if (hasDatabaseUrl() && user) {
    const selectedCourt = courts.find((court) => court.id === parsed.data.courtId);
    if (!selectedCourt) {
      return NextResponse.json({ error: "Court not found" }, { status: 404 });
    }

    const [startHour] = parsed.data.time.split(":");
    const startsAt = new Date(`${parsed.data.date}T${startHour.padStart(2, "0")}:00:00.000Z`);
    const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);

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
        status: "PAID",
        payment: {
          create: {
            userId: user.id,
            amountCents: Math.round(parsed.data.amount * 100),
            status: "PAID",
            provider: "fake",
            providerSessionId: `fake_${Date.now()}`
          }
        }
      },
      include: { court: true }
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
      emailQueued: true,
      paymentMode: "fake"
    }, { status: 201 });
  }

  return NextResponse.json({
    booking: { id: `MVP-${Date.now().toString().slice(-6)}`, ...parsed.data, status: "PAID" },
    emailQueued: true,
    paymentMode: "fake"
  }, { status: 201 });
}
