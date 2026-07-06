import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

export function Label(props: React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>) {
  return <LabelPrimitive.Root className="mb-2 inline-flex text-sm font-medium text-slate-700" {...props} />;
}
