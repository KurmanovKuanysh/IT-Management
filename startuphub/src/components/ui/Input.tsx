import type { ComponentProps } from "react";
import { cn } from "./cn";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-fg",
        "placeholder:text-muted focus:border-primary focus:outline-2 focus:outline-focus/40",
        "aria-[invalid=true]:border-danger",
        className,
      )}
      {...props}
    />
  );
}
