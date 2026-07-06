import { apiError, apiSuccess } from "@/lib/http/api-response";
import { env } from "@/config/env";
import { zapiWebhookDto } from "@/server/dtos/conversation/webhook-dto";
import { ZapiWebhookService } from "@/server/services/zapi-webhook-service";

export async function POST(request: Request) {
  try {
    if (env.ZAPI_WEBHOOK_SECRET) {
      const incomingSecret = request.headers.get("x-webhook-secret");

      if (incomingSecret !== env.ZAPI_WEBHOOK_SECRET) {
        return apiError("Webhook nao autorizado.", 401);
      }
    }

    const body = await request.json();
    const input = zapiWebhookDto.parse({
      phone: body.phone ?? body.from,
      text: body.text?.message ?? body.text ?? "",
      messageId: body.messageId,
      type: body.type ?? "TEXT"
    });

    const service = new ZapiWebhookService();
    const result = await service.handleInboundMessage({
      phone: input.phone,
      text: input.text,
      messageId: input.messageId,
      type: input.type,
      metadata: body
    });

    return apiSuccess({ received: true, result });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Webhook invalido.", 422);
  }
}
