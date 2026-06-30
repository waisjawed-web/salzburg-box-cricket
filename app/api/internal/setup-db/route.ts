import { NextRequest, NextResponse } from "next/server";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const setupToken = "sbc-neon-setup-2026-06-30";

const statements = [
  `DO $$ BEGIN CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'PAID', 'APPROVED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "TournamentStatus" AS ENUM ('DRAFT', 'OPEN', 'FULL', 'LIVE', 'COMPLETED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `CREATE TABLE IF NOT EXISTS "User" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "email" TEXT NOT NULL, "passwordHash" TEXT NOT NULL, "role" "Role" NOT NULL DEFAULT 'USER', "phone" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "User_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "Court" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT NOT NULL, "isActive" BOOLEAN NOT NULL DEFAULT true, "hourlyRate" INTEGER NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Court_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "Booking" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "courtId" TEXT NOT NULL, "startsAt" TIMESTAMP(3) NOT NULL, "endsAt" TIMESTAMP(3) NOT NULL, "totalCents" INTEGER NOT NULL, "status" "BookingStatus" NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Booking_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "Payment" ("id" TEXT NOT NULL, "bookingId" TEXT, "userId" TEXT NOT NULL, "amountCents" INTEGER NOT NULL, "currency" TEXT NOT NULL DEFAULT 'eur', "provider" TEXT NOT NULL DEFAULT 'stripe', "providerSessionId" TEXT, "providerPaymentIntent" TEXT, "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Payment_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "Tournament" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT NOT NULL, "startsAt" TIMESTAMP(3) NOT NULL, "entryFeeCents" INTEGER NOT NULL, "maxTeams" INTEGER NOT NULL, "status" "TournamentStatus" NOT NULL DEFAULT 'OPEN', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "Team" ("id" TEXT NOT NULL, "tournamentId" TEXT NOT NULL, "name" TEXT NOT NULL, "captainName" TEXT NOT NULL, "captainEmail" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Team_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "Match" ("id" TEXT NOT NULL, "tournamentId" TEXT NOT NULL, "courtName" TEXT NOT NULL, "homeTeam" TEXT NOT NULL, "awayTeam" TEXT NOT NULL, "startsAt" TIMESTAMP(3) NOT NULL, "score" TEXT, CONSTRAINT "Match_pkey" PRIMARY KEY ("id"))`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`,
  `CREATE INDEX IF NOT EXISTS "Booking_courtId_startsAt_idx" ON "Booking"("courtId", "startsAt")`,
  `CREATE INDEX IF NOT EXISTS "Booking_userId_idx" ON "Booking"("userId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Payment_bookingId_key" ON "Payment"("bookingId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Team_tournamentId_name_key" ON "Team"("tournamentId", "name")`,
  `DO $$ BEGIN ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN ALTER TABLE "Booking" ADD CONSTRAINT "Booking_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN ALTER TABLE "Team" ADD CONSTRAINT "Team_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN ALTER TABLE "Match" ADD CONSTRAINT "Match_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`
];

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("token") !== setupToken) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "DATABASE_URL is not connected yet" }, { status: 503 });
  }

  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }

  const tables = await prisma.$queryRawUnsafe<{ table_name: string }[]>(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
  );

  return NextResponse.json({ ok: true, tables: tables.map((table) => table.table_name) });
}
