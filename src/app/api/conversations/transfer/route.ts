import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/http/api-response";
import { ConversationService } from "@/server/services/conversation-service";

const conversationTransferDto = z.object({
  conversationId: z.string().min(1),
  aiEnabled: z.boolean()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = conversationTransferDto.parse(body);
    const result = await new ConversationService().toggleAiControl(input.conversationId, input.aiEnabled);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Falha ao atualizar a conversa.", 400);
  }
}
