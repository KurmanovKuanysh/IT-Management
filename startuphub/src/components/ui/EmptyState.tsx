import type { ReactNode } from "react";
import { Card } from "./Card";

export function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center gap-2 p-10 text-center">
      <p className="font-medium text-fg">{title}</p>
      {text && <p className="max-w-md text-sm text-muted">{text}</p>}
      {action && <div className="mt-3">{action}</div>}
    </Card>
  );
}
