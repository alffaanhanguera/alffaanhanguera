import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ALFFA CRM IA",
    short_name: "ALFFA CRM",
    description: "CRM comercial com IA, WhatsApp e Z-API.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f6f9fc",
    theme_color: "#0a2d6f",
    icons: [
      {
        src: "/logo.jpeg",
        sizes: "512x512",
        type: "image/jpeg"
      }
    ]
  };
}
