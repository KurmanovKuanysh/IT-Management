import type { Startup } from "@prisma/client";
import { Badge } from "@/components/ui";

export function StatusBadge({ startup }: { startup: Pick<Startup, "status" | "isHidden"> }) {
  if (startup.isHidden) return <Badge tone="danger">Hidden by moderator</Badge>;
  return startup.status === "PUBLISHED" ? (
    <Badge tone="success">Published</Badge>
  ) : (
    <Badge tone="warning">Draft</Badge>
  );
}
