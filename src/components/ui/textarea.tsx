import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-500/30",
        className
      )}
      {...props}
    />
  );
}
