import { NextResponse } from "next/server";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SETUP_TOKEN = "76dc8a64f2459a6168498a2c2e9ccf3b7238fe1bbaecc68b";
const ADMIN_EMAIL = "waisjawed@icloud.com";

export async function GET(request: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "Database is not connected." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  if (searchParams.get("token") !== SETUP_TOKEN) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const user = await prisma.user.update({
    where: { email: ADMIN_EMAIL },
    data: { role: "ADMIN" },
    select: { id: true, name: true, email: true, role: true }
  });

  return NextResponse.json({ promoted: true, user });
}
