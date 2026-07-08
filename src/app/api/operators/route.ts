import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/http/api-response";
import { OperatorService } from "@/server/services/operator-service";

const operatorDto = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  email: z.string().email(),
  role: z.string().min(3),
  status: z.string().min(3),
  password: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = operatorDto.parse(body);
    const data = await new OperatorService().saveUser(input);
    return apiSuccess(data);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Falha ao salvar operador.", 400);
  }
}
