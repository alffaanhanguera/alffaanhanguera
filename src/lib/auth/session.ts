import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken, verifyRefreshToken } from "@/lib/auth/jwt";

export const getCurrentSession = cache(async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!accessToken && !refreshToken) {
    return null;
  }

  try {
    const payload = accessToken ? await verifyAccessToken(accessToken) : await verifyRefreshToken(refreshToken as string);
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
    if (!refreshToken) {
      return null;
    }

    try {
      const payload = await verifyRefreshToken(refreshToken);
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
  }
});
