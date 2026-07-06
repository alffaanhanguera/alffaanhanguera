import { z } from "zod";

export const zapiWebhookDto = z.object({
  phone: z.string().min(8),
  text: z.string().default(""),
  messageId: z.string().optional(),
  type: z.enum(["TEXT", "IMAGE", "AUDIO", "VIDEO", "DOCUMENT", "PDF", "LOCATION"]).default("TEXT")
});

export type ZapiWebhookDto = z.infer<typeof zapiWebhookDto>;
