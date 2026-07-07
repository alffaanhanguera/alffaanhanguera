import { z } from "zod";

export const changePasswordDto = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8)
});

export type ChangePasswordDto = z.infer<typeof changePasswordDto>;
