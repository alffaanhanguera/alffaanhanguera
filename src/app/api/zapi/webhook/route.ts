import { apiError, apiSuccess } from "@/lib/http/api-response";
import { zapiWebhookDto } from "@/server/dtos/conversation/webhook-dto";
import { ZapiWebhookService } from "@/server/services/zapi-webhook-service";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function normalizePhone(...values: unknown[]) {
  const raw = firstString(...values);

  if (!raw) {
    return undefined;
  }

  const digits = raw.replace(/\D/g, "");
  return digits || undefined;
}

function inferType(body: Record<string, unknown>) {
  const rawType = firstString(body.type, body.messageType, body.event);
  const normalized = rawType?.toUpperCase();

  if (!normalized) {
    return "TEXT";
  }

  if (normalized.includes("IMAGE")) return "IMAGE";
  if (normalized.includes("AUDIO") || normalized.includes("PTT")) return "AUDIO";
  if (normalized.includes("VIDEO")) return "VIDEO";
  if (normalized.includes("DOCUMENT") || normalized.includes("FILE")) return "DOCUMENT";
  if (normalized.includes("PDF")) return "PDF";
  if (normalized.includes("LOCATION")) return "LOCATION";
  return "TEXT";
}

function extractWebhookMessage(body: Record<string, unknown>) {
  const textNode = asRecord(body.text);
  const messageNode = asRecord(body.message);
  const dataNode = asRecord(body.data);
  const dataMessageNode = asRecord(dataNode.message);

  const phone = normalizePhone(
    body.phone,
    body.from,
    dataNode.phone,
    dataNode.from,
    messageNode.phone,
    messageNode.from,
    body.senderPhone
  );

  const text = firstString(
    textNode.message,
    body.text,
    messageNode.text,
    dataNode.text,
    dataMessageNode.text,
    dataMessageNode.body,
    body.body,
    body.caption
  );

  const messageId = firstString(
    body.messageId,
    body.id,
    dataNode.messageId,
    messageNode.messageId,
    dataMessageNode.id
  );

  const type = inferType(body);

  return {
    phone,
    text,
    messageId,
    type
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const extracted = extractWebhookMessage(asRecord(body));

    if (!extracted.phone) {
      return apiSuccess({
        received: true,
        ignored: true,
        reason: "payload_without_phone"
      });
    }

    const input = zapiWebhookDto.parse({
      phone: extracted.phone,
      text: extracted.text ?? `[${extracted.type}]`,
      messageId: extracted.messageId,
      type: extracted.type
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
