import { apiSuccess } from "@/lib/http/api-response";
import { LeadService } from "@/server/services/lead-service";

export async function GET() {
  const service = new LeadService();
  const [leads, columns] = await Promise.all([service.listForPanel(), service.getKanbanData()]);
  return apiSuccess({ leads, columns });
}
