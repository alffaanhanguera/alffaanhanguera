import { z } from "zod";

export const sendConversationMessageDto = z.object({
  conversationId: z.string().min(1),
  content: z.string().trim().min(1).max(4000)
});

export type SendConversationMessageDto = z.infer<typeof sendConversationMessageDto>;
