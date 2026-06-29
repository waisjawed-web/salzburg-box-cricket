import { cookies } from "next/headers";
import { prisma, hasDatabaseUrl } from "@/lib/prisma";

export const SESSION_COOKIE = "sbc_session";

export async function getCurrentUser() {
  if (!hasDatabaseUrl()) return null;

  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });
}
