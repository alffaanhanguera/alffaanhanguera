import { headers } from "next/headers";
import { apiError, apiSuccess } from "@/lib/http/api-response";
import { setAuthCookies } from "@/lib/auth/cookies";
import { loginDto } from "@/server/dtos/auth/login-dto";
import { AuthService } from "@/server/services/auth-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = loginDto.parse(body);
    const headerList = await headers();
    const service = new AuthService();
    const data = await service.login({
      ...input,
      userAgent: headerList.get("user-agent") ?? undefined,
      ipAddress: headerList.get("x-forwarded-for") ?? undefined
    });

    await setAuthCookies(data.accessToken, data.refreshToken);

    return apiSuccess({
      user: {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role
      }
    });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Falha de autenticacao.", 401);
  }
}
