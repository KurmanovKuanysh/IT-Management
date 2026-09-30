import type { ComponentProps } from "react";
import { cn } from "./cn";

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full rounded-control border border-border bg-surface px-3 py-2.5 text-sm text-fg",
        "placeholder:text-muted focus:border-primary focus:outline-2 focus:outline-focus/40",
        "aria-[invalid=true]:border-danger",
        className,
      )}
      {...props}
    />
  );
}
