import { SettingsRepository } from "@/server/repositories/settings-repository";

export class SettingsService {
  constructor(private readonly repository = new SettingsRepository()) {}

  async getPanelData() {
    const settings = await this.repository.getCurrentSettings();

    return {
      ai: settings.ai ?? {
        organizationName: "Alffa Educacao",
        assistantName: "Juliana",
        systemPrompt: "Chatbot Juliana configurado para seguir o fluxo comercial, consultar a base de conhecimento e transferir quando houver etapa manual.",
        transferPrompt: "Transferir quando houver regra manual."
      },
      zapi: settings.zapi ?? {
        instanceId: "",
        baseUrl: "https://api.z-api.io",
        isConnected: false
      }
    };
  }

  async saveAiSettings(input: {
    assistantName: string;
    systemPrompt: string;
    transferPrompt: string;
  }) {
    await this.repository.saveAiSettings(input);
    return this.getPanelData();
  }
}
