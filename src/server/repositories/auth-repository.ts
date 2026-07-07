import { prisma } from "@/lib/prisma";

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });
  }

  async createSession(data: {
    id?: string;
    userId: string;
    refreshTokenHash: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
  }) {
    return prisma.session.create({ data });
  }

  async revokeSession(sessionId: string) {
    return prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() }
    });
  }

  async revokeAllActiveSessionsForUser(userId: string) {
    return prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });
  }

  async getSession(sessionId: string) {
    return prisma.session.findUnique({ where: { id: sessionId } });
  }

  async updateSessionRefreshHash(sessionId: string, refreshTokenHash: string) {
    return prisma.session.update({
      where: { id: sessionId },
      data: { refreshTokenHash }
    });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });
  }

  async touchLastLogin(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date()
      }
    });
  }

  async updatePasswordHash(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash
      }
    });
  }
}
