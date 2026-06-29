import { NextResponse } from "next/server";
import { z } from "zod";
import { bookings } from "@/lib/data";

const bookingSchema = z.object({
  courtId: z.string(),
  date: z.string(),
  time: z.string(),
  userEmail: z.string().email(),
  amount: z.number().positive()
});

export async function GET() {
  return NextResponse.json({ bookings });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = bookingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  return NextResponse.json(
    {
      booking: {
        id: `MVP-${Date.now().toString().slice(-6)}`,
        ...parsed.data,
        status: "PAID"
      },
      emailQueued: true,
      paymentMode: "fake"
    },
    { status: 201 }
  );
}
