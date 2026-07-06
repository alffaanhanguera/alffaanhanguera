import { aiBusinessRules } from "@/server/ai/business-rules";

export const knowledgeBaseSummary = {
  purpose: "Atendimento comercial inicial para matriculas Anhanguera.",
  courseValidation: "Validar curso, cidade, modalidade e turno antes de oferta.",
  benefits: ["ENEM", "Convenio Empresa", "Transferencia", "Segunda Graduacao"],
  forbiddenActions: [
    "Calcular bolsa",
    "Informar valor presencial",
    "Informar valor semipresencial",
    "Gerar PIX ou cartao",
    "Enviar vestibular",
    "Liberar RA"
  ],
  rules: aiBusinessRules
};
