import { apiSuccess } from "@/lib/http/api-response";
import { clearAuthCookies } from "@/lib/auth/cookies";

export async function POST() {
  await clearAuthCookies();
  return apiSuccess({ loggedOut: true });
}
