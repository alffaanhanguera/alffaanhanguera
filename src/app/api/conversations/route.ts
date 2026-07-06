import { apiSuccess } from "@/lib/http/api-response";
import { ConversationService } from "@/server/services/conversation-service";

export async function GET() {
  const items = await new ConversationService().listForInbox();
  return apiSuccess(items);
}
