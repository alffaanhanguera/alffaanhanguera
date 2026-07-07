import { apiError, apiSuccess } from "@/lib/http/api-response";
import { getCurrentSession } from "@/lib/auth/session";
import { changePasswordDto } from "@/server/dtos/auth/change-password-dto";
import { AuthService } from "@/server/services/auth-service";

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return apiError("Sessao invalida.", 401);
    }

    const body = await request.json();
    const input = changePasswordDto.parse(body);
    const result = await new AuthService().changePassword({
      userId: session.user.id,
      ...input
    });

    return apiSuccess(result);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Falha ao alterar senha.", 400);
  }
}
