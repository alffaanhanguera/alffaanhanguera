import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[hsl(var(--primary))] px-4 py-2.5 text-[hsl(var(--primary-foreground))] hover:opacity-90",
        secondary: "bg-[hsl(var(--secondary))] px-4 py-2.5 text-[hsl(var(--secondary-foreground))] hover:opacity-90",
        outline: "border border-[hsl(var(--border))] bg-white px-4 py-2.5 text-[hsl(var(--foreground))] hover:bg-slate-50",
        ghost: "px-3 py-2 text-[hsl(var(--foreground))] hover:bg-slate-100"
      },
      size: {
        default: "h-11",
        sm: "h-9 px-3",
        lg: "h-12 px-6"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
