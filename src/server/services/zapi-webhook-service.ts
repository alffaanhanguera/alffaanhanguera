import { ConversationRepository } from "@/server/repositories/conversation-repository";
import { CommercialFlowService } from "@/server/ai/commercial-flow-service";
import { IntegrationLogRepository } from "@/server/repositories/integration-log-repository";
import { ZApiClient } from "@/server/zapi/zapi-client";

export class ZapiWebhookService {
  constructor(
    private readonly conversations = new ConversationRepository(),
    private readonly commercialFlow = new CommercialFlowService(),
    private readonly integrationLogs = new IntegrationLogRepository(),
    private readonly zapi = new ZApiClient()
  ) {}

  async handleInboundMessage(input: {
    phone: string;
    text: string;
    messageId?: string;
    type: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "DOCUMENT" | "PDF" | "LOCATION";
    metadata?: Record<string, unknown>;
  }) {
    const inboundMessage = await this.conversations.createInboundMessage({
      phone: input.phone,
      content: input.text,
      externalMessageId: input.messageId,
      type: input.type,
      metadata: input.metadata
    });

    const conversation = await this.conversations.getRecentHistoryByPhone(input.phone);

    if (!conversation || !conversation.aiEnabled) {
      return {
        stored: true,
        replied: false,
        automation: "crm-only"
      };
    }

    const chatbotReply = await this.commercialFlow.generateReply({
      phone: input.phone,
      latestMessage: input.text
    });

    await this.conversations.createOutboundAiMessage({
      conversationId: conversation.id,
      content: chatbotReply.answer,
      metadata: {
        source: "chatbot-flow",
        shouldTransfer: chatbotReply.shouldTransfer
      }
    });

    const delivery = await this.zapi.sendTextMessage(input.phone, chatbotReply.answer);

    await this.integrationLogs.create({
      provider: "z-api",
      endpoint: "chatbot-flow-reply",
      statusCode: delivery.status,
      message: delivery.delivered ? "Resposta automatica do fluxo enviada." : "Falha ao enviar resposta automatica do fluxo.",
      payload: {
        phone: input.phone,
        conversationId: conversation.id,
        inboundMessageId: "id" in inboundMessage ? inboundMessage.id : "mock"
      },
      response: delivery
    });

    return {
      stored: true,
      replied: delivery.delivered,
      shouldTransfer: chatbotReply.shouldTransfer,
      automation: "chatbot-flow"
    };
  }
}
