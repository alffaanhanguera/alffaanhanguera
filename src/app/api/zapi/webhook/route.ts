import { apiError, apiSuccess } from "@/lib/http/api-response";
import { zapiWebhookDto } from "@/server/dtos/conversation/webhook-dto";
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ZapiReceivedPayload;
    const ignoreReason = shouldIgnorePayload(body);

    if (ignoreReason) {
      return apiSuccess({
        received: true,
        ignored: true,
        reason: ignoreReason
      });
    }

    const phone = normalizePhone(body.phone);

    if (!isBrazilPhone(phone)) {
      return apiSuccess({
        received: true,
        ignored: true,
        reason: "invalid_phone"
      });
    }

    const type = detectType(body);
    const text = extractText(body, type);

    if (!text) {
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

    return apiSuccess({ received: true, result });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Webhook invalido.", 422);
  }
}
