import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/jwt";

export const getCurrentSession = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyAccessToken(token);
    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId }
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    if (!user) {
      return null;
    }

    return { user, payload };
  } catch {
    return null;
  }
});
