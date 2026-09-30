import type { ComponentProps } from "react";
import { cn } from "./cn";

export function Select({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-fg",
        "focus:border-primary focus:outline-2 focus:outline-focus/40",
        "aria-[invalid=true]:border-danger",
        className,
      )}
      {...props}
    />
  );
}
