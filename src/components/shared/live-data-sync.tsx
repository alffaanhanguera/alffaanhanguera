"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const EDITION_ROUTES = ["/configuracoes", "/n8n", "/ia", "/faq", "/operadores", "/perfil"];

function hasEditableFocus() {
  const activeElement = document.activeElement;

  if (!activeElement) {
    return false;
  }

  if (
    activeElement instanceof HTMLInputElement ||
    activeElement instanceof HTMLTextAreaElement ||
    activeElement instanceof HTMLSelectElement
  ) {
    return true;
  }

  return activeElement.hasAttribute("contenteditable");
}

export function LiveDataSync() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || EDITION_ROUTES.some((route) => pathname.startsWith(route))) {
      return;
    }

    const sync = () => {
      if (document.visibilityState !== "visible" || hasEditableFocus()) {
        return;
      }

      router.refresh();
    };

    const interval = window.setInterval(sync, 10000);
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", sync);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [pathname, router]);

  return null;
}
