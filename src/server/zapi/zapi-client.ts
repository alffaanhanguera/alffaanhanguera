import { env } from "@/config/env";

export class ZApiClient {
  private get baseUrl() {
    return `${env.ZAPI_BASE_URL}/instances/${env.ZAPI_INSTANCE_ID}/token/${env.ZAPI_INSTANCE_TOKEN}`;
  }

  async sendTextMessage(phone: string, message: string) {
    if (!env.ZAPI_INSTANCE_ID || !env.ZAPI_INSTANCE_TOKEN) {
      return {
        delivered: false,
        reason: "Z-API nao configurada."
      };
    }

    const response = await fetch(`${this.baseUrl}/send-text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(env.ZAPI_CLIENT_TOKEN ? { "Client-Token": env.ZAPI_CLIENT_TOKEN } : {})
      },
      body: JSON.stringify({
        phone,
        message
      })
    });

    return {
      delivered: response.ok,
      status: response.status
    };
  }
}
