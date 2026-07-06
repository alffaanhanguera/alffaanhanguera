import { z } from "zod";

export const aiSettingsDto = z.object({
  assistantName: z.string().min(2),
  systemPrompt: z.string().min(10),
  transferPrompt: z.string().min(10)
});

export type AiSettingsDto = z.infer<typeof aiSettingsDto>;
