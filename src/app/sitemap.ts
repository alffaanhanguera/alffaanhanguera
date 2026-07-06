import type { MetadataRoute } from "next";
import { env } from "@/config/env";

const routes = [
  "",
  "/login",
  "/dashboard",
  "/conversas",
  "/leads",
  "/operadores",
  "/ia",
  "/cursos",
  "/ofertas-ead",
  "/beneficios",
  "/faq",
  "/empresas-conveniadas",
  "/configuracoes",
  "/usuarios",
  "/permissoes",
  "/logs",
  "/auditoria",
  "/perfil"
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${env.NEXT_PUBLIC_SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8
  }));
}
