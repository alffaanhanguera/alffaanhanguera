import { SettingsRepository } from "@/server/repositories/settings-repository";

export class SettingsService {
  constructor(private readonly repository = new SettingsRepository()) {}

  async getPanelData() {
    const settings = await this.repository.getCurrentSettings();

    return {
      ai: settings.ai ?? {
        organizationName: "Alffa Educacao",
        assistantName: "Joao",
        systemPrompt: "Configurar chave OpenAI para ativar respostas reais.",
        transferPrompt: "Transferir quando houver regra manual."
      },
      zapi: settings.zapi ?? {
        instanceId: "",
        baseUrl: "https://api.z-api.io",
        isConnected: false
      }
    };
  }
}
