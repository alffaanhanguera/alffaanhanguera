import { apiError, apiSuccess } from "@/lib/http/api-response";
import { LeadService } from "@/server/services/lead-service";

export async function PUT(request: Request, context: { params: Promise<{ leadId: string }> }) {
  try {
    const body = await request.json();
    const { leadId } = await context.params;
    const leads = await new LeadService().updateLead({
      id: leadId,
      ...body
    });
    return apiSuccess({ leads });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Falha ao atualizar o lead.", 400);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ leadId: string }> }) {
  try {
    const { leadId } = await context.params;
    const leads = await new LeadService().deleteLead(leadId);
    return apiSuccess({ leads });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Falha ao excluir o lead.", 400);
  }
}
