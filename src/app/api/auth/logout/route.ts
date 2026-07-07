import { apiSuccess } from "@/lib/http/api-response";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { clearAuthCookies } from "@/lib/auth/cookies";
import { AuthRepository } from "@/server/repositories/auth-repository";

export async function POST() {
  const repository = new AuthRepository();

  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (accessToken) {
      const payload = await verifyAccessToken(accessToken);
      await repository.revokeSession(payload.sessionId);
    }
  } catch {
    // best-effort logout
  }

  await clearAuthCookies();
  return apiSuccess({ loggedOut: true });
}
