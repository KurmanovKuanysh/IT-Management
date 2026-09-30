import type { Startup } from "@prisma/client";
import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { INDUSTRY_LABELS, STAGE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { StartupLogo } from "./StartupLogo";

type CardStartup = Pick<
  Startup,
  "slug" | "name" | "tagline" | "logoUrl" | "industry" | "stage" | "publishedAt" | "createdAt"
>;

export function StartupCard({ startup }: { startup: CardStartup }) {
  return (
    <Card className="group relative flex h-full flex-col gap-4 p-5 transition-colors hover:border-primary/50">
      <div className="flex items-start gap-3">
        <StartupLogo name={startup.name} logoUrl={startup.logoUrl} />
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-fg">
            <Link href={`/startups/${startup.slug}`} className="after:absolute after:inset-0">
              {startup.name}
            </Link>
          </h3>
          <p className="text-xs text-muted">{formatDate(startup.publishedAt ?? startup.createdAt)}</p>
        </div>
      </div>
      <p className="line-clamp-2 flex-1 text-sm text-muted">{startup.tagline}</p>
      <div className="flex flex-wrap gap-2">
        <Badge tone="primary">{INDUSTRY_LABELS[startup.industry]}</Badge>
        <Badge>{STAGE_LABELS[startup.stage]}</Badge>
      </div>
    </Card>
  );
}
