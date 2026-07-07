"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1">
      <Button
        type="button"
        variant={theme === "light" ? "secondary" : "ghost"}
        size="sm"
        className="rounded-full"
        onClick={() => setTheme("light")}
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={theme === "dark" ? "secondary" : "ghost"}
        size="sm"
        className="rounded-full"
        onClick={() => setTheme("dark")}
      >
        <Moon className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className="rounded-full text-xs" onClick={toggleTheme}>
        {theme === "light" ? "Escuro" : "Claro"}
      </Button>
    </div>
  );
}
