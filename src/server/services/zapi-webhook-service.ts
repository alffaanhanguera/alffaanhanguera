import { ConversationRepository } from "@/server/repositories/conversation-repository";
import { CommercialFlowService } from "@/server/ai/commercial-flow-service";
import { IntegrationLogRepository } from "@/server/repositories/integration-log-repository";
import { ZApiClient } from "@/server/zapi/zapi-client";

const PROVISIONAL_ALLOWED_PHONE = "5511978140022";
const PROVISIONAL_FLOW_ACTIVATION_AT = new Date("2026-07-07T19:25:50-03:00");

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

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function isBrazilPhone(value: string) {
  return value.startsWith("55") && value.length >= 12 && value.length <= 13;
}

function shouldIgnoreWebhookMetadata(metadata?: Record<string, unknown>) {
  if (!metadata) {
    return null;
  }

  const dataNode = asRecord(metadata.data);
  const messageNode = asRecord(metadata.message);
  const nestedMessageNode = asRecord(dataNode.message);
  const callbackType = firstString(
    metadata.type,
    metadata.event,
    dataNode.type,
    dataNode.event,
    messageNode.type,
    nestedMessageNode.type
  );

  if (callbackType && callbackType !== "ReceivedCallback") {
    return "non_received_callback";
  }

  return null;
}

function isFlowAllowed(params: { phone: string; createdAt: Date }) {
  if (params.phone === PROVISIONAL_ALLOWED_PHONE) {
    return true;
  }

  return params.createdAt >= PROVISIONAL_FLOW_ACTIVATION_AT;
}

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
    const metadataIgnoreReason = shouldIgnoreWebhookMetadata(input.metadata);

    if (metadataIgnoreReason) {
      return {
        stored: false,
        replied: false,
        ignored: true,
        reason: metadataIgnoreReason
      };
    }

    const normalizedPhone = normalizePhone(input.phone);

    if (!isBrazilPhone(normalizedPhone)) {
      return {
        stored: false,
        replied: false,
        ignored: true,
        reason: "invalid_phone"
      };
    }

    const inboundMessage = await this.conversations.createInboundMessage({
      phone: normalizedPhone,
      content: input.text,
      externalMessageId: input.messageId,
      type: input.type,
      metadata: input.metadata
    });

    const conversation = await this.conversations.getRecentHistoryByPhone(normalizedPhone);

    if (!conversation || !conversation.aiEnabled) {
      return {
        stored: true,
        replied: false,
        automation: "crm-only"
      };
    }

    if (!isFlowAllowed({ phone: normalizedPhone, createdAt: conversation.lead.createdAt })) {
      if (conversation.aiEnabled) {
        await this.conversations.updateConversation(conversation.id, {
          aiEnabled: false
        });
      }

      await this.integrationLogs.create({
        provider: "z-api",
        endpoint: "chatbot-flow-gated",
        statusCode: 200,
        message: "Lead salvo no CRM sem automacao por regra provisoria de producao.",
        payload: {
          phone: normalizedPhone,
          leadCreatedAt: conversation.lead.createdAt.toISOString(),
          activationAt: PROVISIONAL_FLOW_ACTIVATION_AT.toISOString(),
          allowedLegacyPhone: PROVISIONAL_ALLOWED_PHONE
        },
        response: {
          stored: true,
          replied: false,
          automation: "crm-only",
          gated: true
        }
      });

      return {
        stored: true,
        replied: false,
        automation: "crm-only",
        gated: true
      };
    }

    const chatbotReply = await this.commercialFlow.generateReply({
      phone: normalizedPhone,
      latestMessage: input.text
    });

    let replied = false;

    if (chatbotReply.answer?.trim()) {
      await this.conversations.createOutboundAiMessage({
        conversationId: conversation.id,
        content: chatbotReply.answer,
        metadata: {
          source: "chatbot-flow",
          shouldTransfer: chatbotReply.shouldTransfer
        }
      });

      const delivery = await this.zapi.sendTextMessage(normalizedPhone, chatbotReply.answer);
      replied = delivery.delivered;

      await this.integrationLogs.create({
        provider: "z-api",
        endpoint: "chatbot-flow-reply",
        statusCode: delivery.status,
        message: delivery.delivered ? "Resposta automatica do fluxo enviada." : "Falha ao enviar resposta automatica do fluxo.",
        payload: {
          phone: normalizedPhone,
          conversationId: conversation.id,
          inboundMessageId: "id" in inboundMessage ? inboundMessage.id : "mock"
        },
        response: delivery
      });
    }

    for (const followUp of chatbotReply.followUps ?? []) {
      if (followUp.delayMs) {
        await new Promise((resolve) => setTimeout(resolve, followUp.delayMs));
      }

      await this.conversations.createOutboundAiMessage({
        conversationId: conversation.id,
        content: followUp.content,
        metadata: {
          source: "chatbot-flow-follow-up",
          shouldTransfer: chatbotReply.shouldTransfer
        }
      });

      const followUpDelivery = await this.zapi.sendTextMessage(normalizedPhone, followUp.content);
      replied = replied || followUpDelivery.delivered;

      await this.integrationLogs.create({
        provider: "z-api",
        endpoint: "chatbot-flow-follow-up",
        statusCode: followUpDelivery.status,
        message: followUpDelivery.delivered ? "Retorno automatico complementar enviado." : "Falha ao enviar retorno automatico complementar.",
        payload: {
          phone: normalizedPhone,
          conversationId: conversation.id,
          inboundMessageId: "id" in inboundMessage ? inboundMessage.id : "mock"
        },
        response: followUpDelivery
      });
    }

    return {
      stored: true,
      replied,
      shouldTransfer: chatbotReply.shouldTransfer,
      automation: "chatbot-flow"
    };
  }
}
