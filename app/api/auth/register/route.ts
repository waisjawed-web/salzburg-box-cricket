import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "Database is not configured yet." }, { status: 503 });
  }

  const parsed = registerSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid registration details", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();
  const passwordHash = await bcrypt.hash(password, 10);
  const role = normalizedEmail.includes("admin") ? "ADMIN" : "USER";

  let user: { id: string; name: string; email: string; role: string };

  try {
    user = await prisma.user.create({
      data: { name, email: normalizedEmail, passwordHash, role },
      select: { id: true, name: true, email: true, role: true }
    });
  } catch {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  let emailQueued = false;
  try {
    const emailResult = await sendWelcomeEmail({
      to: user.email,
      customerName: user.name
    });
    emailQueued = !emailResult.skipped && !emailResult.error;
  } catch {
    emailQueued = false;
  }

  const response = NextResponse.json({ user, emailQueued }, { status: 201 });
  response.cookies.set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
  return response;
}
