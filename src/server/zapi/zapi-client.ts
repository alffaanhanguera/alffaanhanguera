import { env } from "@/config/env";

export class ZApiClient {
  private get baseUrl() {
    return `${env.ZAPI_BASE_URL}/instances/${env.ZAPI_INSTANCE_ID}/token/${env.ZAPI_INSTANCE_TOKEN}`;
  }

  private async post(endpoint: string, body: Record<string, unknown>) {
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(env.ZAPI_CLIENT_TOKEN ? { "Client-Token": env.ZAPI_CLIENT_TOKEN } : {})
      },
      body: JSON.stringify(body)
    });

    let responseBody: unknown = null;

    try {
      responseBody = await response.json();
    } catch {
      try {
        responseBody = await response.text();
      } catch {
        responseBody = null;
      }
    }

    const payload =
      typeof responseBody === "object" && responseBody ? (responseBody as Record<string, unknown>) : undefined;
    const messageId =
      typeof payload?.messageId === "string"
        ? payload.messageId
        : typeof payload?.zaapId === "string"
          ? payload.zaapId
          : typeof payload?.id === "string"
            ? payload.id
            : undefined;

    return {
      delivered: response.ok,
      status: response.status,
      messageId,
      responseBody
    };
  }

  async sendTextMessage(
    phone: string,
    message: string,
    options?: {
      delayMessage?: number;
      delayTyping?: number;
      editMessageId?: string;
    }
  ) {
    if (!env.ZAPI_INSTANCE_ID || !env.ZAPI_INSTANCE_TOKEN) {
      return {
        delivered: false,
        status: 503,
        reason: "Z-API nao configurada."
      };
    }

    return this.post("send-text", {
      phone,
      message,
      ...(options?.delayMessage ? { delayMessage: options.delayMessage } : {}),
      ...(options?.delayTyping ? { delayTyping: options.delayTyping } : {}),
      ...(options?.editMessageId ? { editMessageId: options.editMessageId } : {})
    });
  }

  async sendImageMessage(phone: string, image: string, caption?: string) {
    if (!env.ZAPI_INSTANCE_ID || !env.ZAPI_INSTANCE_TOKEN) {
      return {
        delivered: false,
        status: 503,
        reason: "Z-API nao configurada."
      };
    }

    return this.post("send-image", {
      phone,
      image,
      caption
    });
  }

  async sendDocumentMessage(phone: string, document: string, fileName: string, caption?: string) {
    if (!env.ZAPI_INSTANCE_ID || !env.ZAPI_INSTANCE_TOKEN) {
      return {
        delivered: false,
        status: 503,
        reason: "Z-API nao configurada."
      };
    }

    return this.post("send-document", {
      phone,
      document,
      fileName,
      caption
    });
  }

  async sendAudioMessage(phone: string, audio: string) {
    if (!env.ZAPI_INSTANCE_ID || !env.ZAPI_INSTANCE_TOKEN) {
      return {
        delivered: false,
        status: 503,
        reason: "Z-API nao configurada."
      };
    }

    return this.post("send-audio", {
      phone,
      audio
    });
  }

  async sendVideoMessage(phone: string, video: string, caption?: string) {
    if (!env.ZAPI_INSTANCE_ID || !env.ZAPI_INSTANCE_TOKEN) {
      return {
        delivered: false,
        status: 503,
        reason: "Z-API nao configurada."
      };
    }

    return this.post("send-video", {
      phone,
      video,
      caption
    });
  }
}
