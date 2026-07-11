import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/http/api-response";
import { ConversationService } from "@/server/services/conversation-service";

const updateConversationDto = z.object({
  tags: z.array(z.string().trim().min(1).max(60)).max(30).optional(),
  leadNotes: z.string().trim().max(5000).nullable().optional(),
  pipelineStageId: z.string().trim().min(1).optional()
});

export async function PATCH(request: Request, context: { params: Promise<{ conversationId: string }> }) {
  try {
    const body = await request.json();
    const input = updateConversationDto.parse(body);
    const { conversationId } = await context.params;
    const detail = await new ConversationService().updateConversationMetadata({
      conversationId,
      tags: input.tags,
      leadNotes: input.leadNotes,
      pipelineStageId: input.pipelineStageId
    });

    return apiSuccess({ detail });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Falha ao atualizar a conversa.", 400);
  }
}
