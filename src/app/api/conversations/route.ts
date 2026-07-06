import { apiError, apiSuccess } from "@/lib/http/api-response";
import { sendConversationMessageDto } from "@/server/dtos/conversation/send-message-dto";
import { ConversationService } from "@/server/services/conversation-service";

export async function GET() {
  const items = await new ConversationService().listForInbox();
  return apiSuccess(items);
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
