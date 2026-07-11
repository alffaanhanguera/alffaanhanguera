import { apiError, apiSuccess } from "@/lib/http/api-response";
import { zapiWebhookDto } from "@/server/dtos/conversation/webhook-dto";
import { IntegrationLogRepository } from "@/server/repositories/integration-log-repository";
import { ZapiWebhookService } from "@/server/services/zapi-webhook-service";

type ZapiReceivedPayload = {
  type?: string;
  status?: string;
  fromMe?: boolean;
  isGroup?: boolean;
  isNewsletter?: boolean;
  isStatusReply?: boolean;
  waitingMessage?: boolean;
  notification?: string;
  phone?: string;
  connectedPhone?: string;
  participantPhone?: string | null;
  messageId?: string;
  text?: {
    message?: string;
    description?: string;
    title?: string;
    url?: string;
  };
  image?: {
    caption?: string;
    imageUrl?: string;
    mimeType?: string;
    downloadError?: string | null;
  };
  audio?: {
    audioUrl?: string;
    mimeType?: string;
    seconds?: number;
    ptt?: boolean;
  };
  video?: {
    caption?: string;
    videoUrl?: string;
    mimeType?: string;
    seconds?: number;
  };
  document?: {
    documentUrl?: string;
    mimeType?: string;
    title?: string;
    fileName?: string;
  };
  location?: {
    address?: string;
    latitude?: number;
    longitude?: number;
    url?: string;
  };
  buttonsResponseMessage?: {
    buttonId?: string;
    message?: string;
  };
  listResponseMessage?: {
    message?: string;
    title?: string;
    selectedRowId?: string;
  };
  reaction?: {
    value?: string;
  };
};

function normalizePhone(value?: string | null) {
  if (!value) {
    return undefined;
  }

  const digits = value.replace(/\D/g, "");
  return digits || undefined;
}

function isBrazilPhone(value?: string) {
  return Boolean(value && value.startsWith("55") && value.length >= 12 && value.length <= 13);
}

function detectType(payload: ZapiReceivedPayload) {
  if (payload.image?.imageUrl || payload.image?.downloadError !== undefined) {
    return "IMAGE" as const;
  }

  if (payload.audio?.audioUrl) {
    return "AUDIO" as const;
  }

  if (payload.video?.videoUrl) {
    return "VIDEO" as const;
  }

  if (payload.document?.documentUrl) {
    const mimeType = payload.document.mimeType?.toLowerCase() ?? "";
    return mimeType.includes("pdf") ? ("PDF" as const) : ("DOCUMENT" as const);
  }

  if (payload.location) {
    return "LOCATION" as const;
  }

  return "TEXT" as const;
}

function extractText(payload: ZapiReceivedPayload, type: ReturnType<typeof detectType>) {
  const textMessage = payload.text?.message?.trim();

  if (textMessage) {
    return textMessage;
  }

  const buttonReply = payload.buttonsResponseMessage?.message?.trim();

  if (buttonReply) {
    return buttonReply;
  }

  const listReply = payload.listResponseMessage?.message?.trim() || payload.listResponseMessage?.title?.trim();

  if (listReply) {
    return listReply;
  }

  const reaction = payload.reaction?.value?.trim();

  if (reaction) {
    return `[REACTION] ${reaction}`;
  }

  if (type === "IMAGE") {
    return payload.image?.caption?.trim() || "[IMAGE]";
  }

  if (type === "AUDIO") {
    return "[AUDIO]";
  }

  if (type === "VIDEO") {
    return payload.video?.caption?.trim() || "[VIDEO]";
  }

  if (type === "PDF") {
    return payload.document?.fileName?.trim() || payload.document?.title?.trim() || "[PDF]";
  }

  if (type === "DOCUMENT") {
    return payload.document?.fileName?.trim() || payload.document?.title?.trim() || "[DOCUMENT]";
  }

  if (type === "LOCATION") {
    return payload.location?.address?.trim() || "[LOCATION]";
  }

  return undefined;
}

function shouldIgnorePayload(payload: ZapiReceivedPayload) {
  if (payload.fromMe && payload.messageId && payload.status && payload.status.toUpperCase() !== "RECEIVED") {
    return null;
  }

  if (payload.type !== "ReceivedCallback") {
    return "non_received_callback";
  }

  if (payload.status?.toUpperCase() !== "RECEIVED") {
    return "non_received_status";
  }

  if (payload.fromMe) {
    return "outbound_message_event";
  }

  if (payload.isGroup) {
    return "group_message";
  }

  if (payload.isNewsletter) {
    return "newsletter_message";
  }

  if (payload.isStatusReply) {
    return "status_reply";
  }

  if (payload.waitingMessage) {
    return "waiting_message";
  }

  if (payload.notification) {
    return "notification_event";
  }

  return null;
}

function buildWebhookSummary(payload: ZapiReceivedPayload) {
  return {
    type: payload.type ?? null,
    status: payload.status ?? null,
    fromMe: payload.fromMe ?? null,
    isGroup: payload.isGroup ?? null,
    isNewsletter: payload.isNewsletter ?? null,
    isStatusReply: payload.isStatusReply ?? null,
    waitingMessage: payload.waitingMessage ?? null,
    notification: payload.notification ?? null,
    phone: payload.phone ?? null,
    connectedPhone: payload.connectedPhone ?? null,
    participantPhone: payload.participantPhone ?? null,
    messageId: payload.messageId ?? null
  };
}

export async function POST(request: Request) {
  const integrationLogs = new IntegrationLogRepository();

  try {
    const body = (await request.json()) as ZapiReceivedPayload;

    if (body.fromMe && body.messageId && body.status && body.status.toUpperCase() !== "RECEIVED") {
      const status = body.status.toUpperCase();

      await new ZapiWebhookService().handleOutboundStatus({
        messageId: body.messageId,
        status,
        occurredAt: new Date()
      });

      await integrationLogs.create({
        provider: "z-api",
        endpoint: "webhook-outbound-status",
        statusCode: 200,
        message: `Status outbound processado: ${status}`,
        payload: buildWebhookSummary(body),
        response: {
          received: true,
          outboundStatus: status
        }
      });

      return apiSuccess({
        received: true,
        outboundStatus: status
      });
    }

    const ignoreReason = shouldIgnorePayload(body);

    if (ignoreReason) {
      await integrationLogs.create({
        provider: "z-api",
        endpoint: "webhook-ignored",
        statusCode: 200,
        message: `Webhook ignorado: ${ignoreReason}`,
        payload: buildWebhookSummary(body),
        response: {
          received: true,
          ignored: true,
          reason: ignoreReason
        }
      });

      return apiSuccess({
        received: true,
        ignored: true,
        reason: ignoreReason
      });
    }

    const phone = normalizePhone(body.phone);

    if (!isBrazilPhone(phone)) {
      await integrationLogs.create({
        provider: "z-api",
        endpoint: "webhook-ignored",
        statusCode: 200,
        message: "Webhook ignorado: invalid_phone",
        payload: buildWebhookSummary(body),
        response: {
          received: true,
          ignored: true,
          reason: "invalid_phone"
        }
      });

      return apiSuccess({
        received: true,
        ignored: true,
        reason: "invalid_phone"
      });
    }

    const type = detectType(body);
    const text = extractText(body, type);

    if (!text) {
      await integrationLogs.create({
        provider: "z-api",
        endpoint: "webhook-ignored",
        statusCode: 200,
        message: "Webhook ignorado: payload_without_content",
        payload: buildWebhookSummary(body),
        response: {
          received: true,
          ignored: true,
          reason: "payload_without_content"
        }
      });

      return apiSuccess({
        received: true,
        ignored: true,
        reason: "payload_without_content"
      });
    }

    const input = zapiWebhookDto.parse({
      phone,
      text,
      messageId: body.messageId,
      type
    });

    const result = await new ZapiWebhookService().handleInboundMessage({
      phone: input.phone,
      text: input.text,
      messageId: input.messageId,
      type: input.type,
      metadata: body as Record<string, unknown>
    });

    await integrationLogs.create({
      provider: "z-api",
      endpoint: "webhook-processed",
      statusCode: 200,
      message: "Webhook de mensagem recebido e processado.",
      payload: {
        ...buildWebhookSummary(body),
        normalizedPhone: input.phone,
        textPreview: input.text.slice(0, 160),
        detectedType: input.type
      },
      response: result as Record<string, unknown>
    });

    return apiSuccess({ received: true, result });
  } catch (error) {
    await integrationLogs.create({
      provider: "z-api",
      endpoint: "webhook-error",
      statusCode: 422,
      message: error instanceof Error ? error.message : "Webhook invalido.",
      response: {
        error: error instanceof Error ? error.message : "Webhook invalido."
      }
    });

    return apiError(error instanceof Error ? error.message : "Webhook invalido.", 422);
  }
}
