import { apiError, apiSuccess } from "@/lib/http/api-response";
import { OpenAIClient } from "@/server/ai/openai-client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await new OpenAIClient().generateReply({
      leadName: body.leadName ?? "Lead",
      history: Array.isArray(body.history) ? body.history : [],
      latestMessage: body.latestMessage ?? ""
    });

    return apiSuccess(result);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Falha ao gerar resposta.", 500);
  }
}
