import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@salzburgboxcricket.at" },
    update: {},
    create: {
      name: "Salzburg Admin",
      email: "admin@salzburgboxcricket.at",
      passwordHash,
      role: "ADMIN"
    }
  });

  const user = await prisma.user.upsert({
    where: { email: "player@example.com" },
    update: {},
    create: {
      name: "Demo Player",
      email: "player@example.com",
      passwordHash,
      role: "USER"
    }
  });

  const court = await prisma.court.create({
    data: {
      name: "Court 3 - Match Box",
      description: "Full box cricket court for 6v6 games, leagues, and corporate events.",
      hourlyRate: 5500
    }
  });

  await prisma.booking.create({
    data: {
      userId: user.id,
      courtId: court.id,
      startsAt: new Date("2026-07-03T18:00:00.000Z"),
      endsAt: new Date("2026-07-03T19:00:00.000Z"),
      totalCents: 5500,
      status: "PAID",
      payment: {
        create: {
          userId: user.id,
          amountCents: 5500,
          status: "PAID",
          providerSessionId: "fake_mvp_session"
        }
      }
    }
  });

  await prisma.tournament.create({
    data: {
      name: "Summer Sixers Cup",
      description: "One-day indoor box cricket tournament for local Salzburg teams.",
      startsAt: new Date("2026-07-18T10:00:00.000Z"),
      entryFeeCents: 12000,
      maxTeams: 12,
      status: "OPEN"
    }
  });

  console.log(`Seeded demo admin ${admin.email} and player ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
