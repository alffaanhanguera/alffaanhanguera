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

    return {
      delivered: response.ok,
      status: response.status
    };
  }

  async sendTextMessage(phone: string, message: string) {
    if (!env.ZAPI_INSTANCE_ID || !env.ZAPI_INSTANCE_TOKEN) {
      return {
        delivered: false,
        status: 503,
        reason: "Z-API nao configurada."
      };
    }

    return this.post("send-text", {
      phone,
      message
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
