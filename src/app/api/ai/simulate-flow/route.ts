import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/http/api-response";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { ConversationRepository } from "@/server/repositories/conversation-repository";
import { ZapiWebhookService } from "@/server/services/zapi-webhook-service";

const simulateFlowDto = z.object({
  phone: z.string().min(10),
  text: z.string().trim().min(1).optional(),
  reset: z.boolean().optional()
});

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return apiError("Nao autenticado.", 401);
    }

    const body = await request.json();
    const input = simulateFlowDto.parse(body);
    const phone = input.phone.replace(/\D/g, "");

    if (input.reset) {
      const lead = await prisma.lead.findUnique({
        where: { phone },
        select: { id: true }
      });

      if (lead) {
        await prisma.lead.delete({
          where: { id: lead.id }
        });
      }
    }

    let result: Record<string, unknown> = {
      reset: Boolean(input.reset)
    };

    if (input.text) {
      result = await new ZapiWebhookService().handleInboundMessage({
        phone,
        text: input.text,
        type: "TEXT",
        messageId: `sim-${Date.now()}`,
        metadata: {
          type: "ReceivedCallback",
          phone,
          text: {
            message: input.text
          },
          status: "RECEIVED",
          fromMe: false,
          fromApi: false,
          isGroup: false,
          connectedPhone: "simulation"
        }
      });
    }

    const conversation = await new ConversationRepository().getRecentHistoryByPhone(phone, 50);

    return apiSuccess({
      result,
      conversation: conversation
        ? {
            id: conversation.id,
            leadName: conversation.lead.fullName,
            phone: conversation.lead.phone,
            aiEnabled: conversation.aiEnabled,
            status: conversation.status,
            messages: conversation.messages.map((message) => ({
              id: message.id,
              content: message.content,
              direction: message.direction,
              createdAt: message.createdAt
            }))
          }
        : null
    });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Falha ao simular fluxo.", 400);
  }
}
