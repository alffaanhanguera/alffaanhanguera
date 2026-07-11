import { cookies } from "next/headers";
import { apiError, apiSuccess } from "@/lib/http/api-response";
import { AuthService } from "@/server/services/auth-service";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return apiError("Refresh token ausente.", 401);
  }

  try {
    const accessToken = await new AuthService().refresh(refreshToken);
    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24
    });

    return apiSuccess({ refreshed: true });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Falha ao renovar sessao.", 401);
  }
}
