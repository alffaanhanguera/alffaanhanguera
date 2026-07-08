import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/http/api-response";
import { LeadService } from "@/server/services/lead-service";

const leadStatusDto = z.object({
  columnId: z.string().min(1)
});

export async function PATCH(request: Request, context: { params: Promise<{ leadId: string }> }) {
  try {
    const body = await request.json();
    const input = leadStatusDto.parse(body);
    const { leadId } = await context.params;
    const service = new LeadService();
    const [columns, leads] = await Promise.all([
      service.updateLeadStatus(leadId, input.columnId),
      service.listForPanel()
    ]);
    return apiSuccess({ columns, leads });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Falha ao mover o lead.", 400);
  }
}
