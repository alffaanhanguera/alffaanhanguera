import { apiError, apiSuccess } from "@/lib/http/api-response";
import { ConversationService } from "@/server/services/conversation-service";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const conversationId = String(formData.get("conversationId") ?? "");
    const caption = String(formData.get("caption") ?? "");
    const file = formData.get("file");

    if (!conversationId) {
      return apiError("Conversa nao informada.", 400);
    }

    if (!(file instanceof File)) {
      return apiError("Arquivo nao enviado.", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return apiError("Arquivo acima do limite de 10MB.", 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "application/octet-stream";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const result = await new ConversationService().sendManualMediaReply({
      conversationId,
      fileName: file.name,
      mimeType,
      dataUrl,
      caption
    });

    return apiSuccess(result);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Falha ao enviar arquivo.", 400);
  }
}
