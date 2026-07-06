import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-2xl border bg-white px-4 py-2 text-sm shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-blue-100",
        className
      )}
      {...props}
    />
  );
}
