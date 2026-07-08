import { apiError, apiSuccess } from "@/lib/http/api-response";
import { aiSettingsDto } from "@/server/dtos/settings/settings-dto";
import { SettingsService } from "@/server/services/settings-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = aiSettingsDto.parse(body);
    const data = await new SettingsService().saveAiSettings(input);
    return apiSuccess(data);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Falha ao salvar configuracoes da IA.", 400);
  }
}
