import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/security/rate-limit";

const protectedRoutes = [
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

export function proxy(request: NextRequest) {
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  const rate = checkRateLimit(clientIp, 120, 60_000);

  if (!rate.success) {
    return NextResponse.json({ success: false, error: "Too many requests." }, { status: 429 });
  }

  const accessToken = request.cookies.get("accessToken")?.value;

  if (protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route)) && !accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.jpeg|manifest.webmanifest|robots.txt|sitemap.xml).*)"]
};
