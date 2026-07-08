import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/http/api-response";
import { FaqService } from "@/server/services/faq-service";

const faqMutationDto = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("faq"),
    id: z.string().optional(),
    category: z.string().min(1),
    question: z.string().min(1),
    answer: z.string().min(1),
    priority: z.number().optional()
  }),
  z.object({
    type: z.literal("document"),
    id: z.string().optional(),
    category: z.string().min(1),
    title: z.string().min(1),
    content: z.string().min(1)
  })
]);

export async function GET() {
  return apiSuccess(await new FaqService().getPanelData());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = faqMutationDto.parse(body);
    const service = new FaqService();
    const data =
      input.type === "faq"
        ? await service.saveFaqItem(input)
        : await service.saveKnowledgeDocument(input);
    return apiSuccess(data);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Falha ao salvar item do FAQ.", 400);
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    if (!id || !type) {
      return apiError("Item nao informado.", 400);
    }

    const service = new FaqService();
    const data =
      type === "faq"
        ? await service.deleteFaqItem(id)
        : await service.deleteKnowledgeDocument(id);
    return apiSuccess(data);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Falha ao excluir item do FAQ.", 400);
  }
}
