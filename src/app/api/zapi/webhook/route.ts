import { apiError, apiSuccess } from "@/lib/http/api-response";
import { zapiWebhookDto } from "@/server/dtos/conversation/webhook-dto";
import { ZapiWebhookService } from "@/server/services/zapi-webhook-service";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
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
  const dataNode = asRecord(body.data);
  const messageNode = asRecord(body.message);
  const dataMessageNode = asRecord(dataNode.message);
  const rawType = firstString(body.type, body.messageType, body.event, dataNode.type, messageNode.type, dataMessageNode.type, body.mimetype);
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

function extractNestedPhone(body: Record<string, unknown>) {
  const dataNode = asRecord(body.data);
  const messageNode = asRecord(body.message);
  const dataMessageNode = asRecord(dataNode.message);
  const senderNode = asRecord(body.sender);
  const chatNode = asRecord(body.chat);
  const contactNode = asRecord(body.contact);
  const visitorNode = asRecord(body.visitor);
  const messages = asArray(body.messages);
  const firstMessage = asRecord(messages[0]);

  return normalizePhone(
    body.phone,
    body.from,
    body.chatId,
    body.remoteJid,
    body.senderPhone,
    dataNode.phone,
    dataNode.from,
    dataNode.chatId,
    dataNode.remoteJid,
    messageNode.phone,
    messageNode.from,
    messageNode.chatId,
    dataMessageNode.phone,
    dataMessageNode.from,
    dataMessageNode.chatId,
    senderNode.phone,
    senderNode.id,
    chatNode.phone,
    chatNode.id,
    contactNode.phone,
    contactNode.wa_id,
    visitorNode.phone,
    visitorNode.id,
    firstMessage.phone,
    firstMessage.from
  );
}

function extractWebhookMessage(body: Record<string, unknown>) {
  const textNode = asRecord(body.text);
  const messageNode = asRecord(body.message);
  const dataNode = asRecord(body.data);
  const dataMessageNode = asRecord(dataNode.message);
  const extendedTextNode = asRecord(body.messageText);
  const senderNode = asRecord(body.sender);
  const chatNode = asRecord(body.chat);
  const messages = asArray(body.messages);
  const firstMessage = asRecord(messages[0]);

  const phone = extractNestedPhone(body);

  const text = firstString(
    textNode.message,
    body.text,
    messageNode.text,
    dataNode.text,
    dataMessageNode.text,
    dataMessageNode.body,
    extendedTextNode.text,
    body.body,
    body.caption,
    messageNode.body,
    dataNode.body,
    senderNode.name,
    chatNode.subject,
    firstMessage.text,
    firstMessage.body
  );

  const messageId = firstString(
    body.messageId,
    body.id,
    dataNode.messageId,
    messageNode.messageId,
    dataMessageNode.id,
    dataNode.id,
    firstMessage.id
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
