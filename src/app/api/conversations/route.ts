import { apiError, apiSuccess } from "@/lib/http/api-response";
import { sendConversationMessageDto } from "@/server/dtos/conversation/send-message-dto";
import { ConversationService } from "@/server/services/conversation-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId") ?? undefined;
  const service = new ConversationService();
  const items = await service.listForInbox();

  if (!conversationId) {
    return apiSuccess(items);
  }

  const detail = await service.getConversationDetail(conversationId);
  return apiSuccess({
    items,
    detail
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = sendConversationMessageDto.parse(body);
    const result = await new ConversationService().sendManualReply(input);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Falha ao enviar mensagem.", 400);
  }
}
