import { randomUUID } from "node:crypto";
import { compare, hash } from "bcryptjs";
import { AuthRepository } from "@/server/repositories/auth-repository";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/lib/auth/jwt";

export class AuthService {
  constructor(private readonly repository = new AuthRepository()) {}

  async login(input: { email: string; password: string; userAgent?: string; ipAddress?: string }) {
    const user = await this.repository.findUserByEmail(input.email);

    if (!user) {
      throw new Error("Credenciais invalidas.");
    }

    const passwordMatches = await compare(input.password, user.passwordHash);

    if (!passwordMatches) {
      throw new Error("Credenciais invalidas.");
    }

    await this.repository.revokeAllActiveSessionsForUser(user.id);
    const sessionId = randomUUID();

    await this.repository.createSession({
      userId: user.id,
      refreshTokenHash: "pending",
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      id: sessionId
    });

    const accessToken = await signAccessToken({
      sub: user.id,
      role: user.role,
      sessionId
    });

    const refreshToken = await signRefreshToken({
      sub: user.id,
      role: user.role,
      sessionId
    });

    await this.repository.updateSessionRefreshHash(sessionId, await hash(refreshToken, 12));

    await this.repository.touchLastLogin(user.id);

    return {
      accessToken,
      refreshToken,
      user
    };
  }

  async refresh(refreshToken: string) {
    const payload = await verifyRefreshToken(refreshToken);
    const session = await this.repository.getSession(payload.sessionId);

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new Error("Sessao invalida.");
    }

    const refreshMatches = await compare(refreshToken, session.refreshTokenHash);

    if (!refreshMatches) {
      throw new Error("Refresh token invalido.");
    }

    const user = await this.repository.findUserById(payload.sub);

    if (!user) {
      throw new Error("Usuario nao encontrado.");
    }

    return signAccessToken({
      sub: user.id,
      role: user.role,
      sessionId: session.id
    });
  }

  async changePassword(input: { userId: string; currentPassword: string; newPassword: string }) {
    const user = await this.repository.findUserById(input.userId);

    if (!user) {
      throw new Error("Usuario nao encontrado.");
    }

    const passwordMatches = await compare(input.currentPassword, user.passwordHash);

    if (!passwordMatches) {
      throw new Error("A senha atual esta incorreta.");
    }

    if (input.currentPassword === input.newPassword) {
      throw new Error("A nova senha precisa ser diferente da atual.");
    }

    await this.repository.updatePasswordHash(user.id, await hash(input.newPassword, 12));

    return {
      success: true
    };
  }
}
