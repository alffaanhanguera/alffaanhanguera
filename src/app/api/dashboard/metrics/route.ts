import { apiSuccess } from "@/lib/http/api-response";
import { DashboardService } from "@/server/services/dashboard-service";

export async function GET() {
  const data = await new DashboardService().getSummary();
  return apiSuccess(data);
}
