import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Badge, ButtonLink, Card } from "@/components/ui";
import { ApiActionButton } from "@/components/common/ApiActionButton";
import { StartupLogo } from "@/components/startups/StartupLogo";
import { StatusBadge } from "@/components/startups/StatusBadge";
import { getCurrentUser } from "@/lib/auth";
import { INDUSTRY_LABELS, STAGE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { canEdit, canView, findBySlug, isPublic } from "@/lib/startups";

type Props = { params: Promise<{ slug: string }> };

// Один запрос к БД на generateMetadata и саму страницу.
const load = cache(async (slug: string) => {
  const [startup, viewer] = await Promise.all([findBySlug(slug), getCurrentUser()]);
  if (!startup || !canView(startup, viewer)) return null;
  return { startup, viewer };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await load((await params).slug);
  if (!data) return { title: "Not found" };
  return { title: data.startup.name, description: data.startup.tagline };
}

// Страница стартапа (FR-22…24). Чужой черновик — 404 (FR-23).
export default async function StartupPage({ params }: Props) {
  const data = await load((await params).slug);
  if (!data) notFound();
  const { startup, viewer } = data;
  const editable = canEdit(startup, viewer);

  const links = [
    { label: "Website", href: startup.websiteUrl },
    { label: "Pitch deck", href: startup.pitchDeckUrl },
  ].filter((l): l is { label: string; href: string } => !!l.href);

  const facts = [
    { label: "Industry", value: INDUSTRY_LABELS[startup.industry] },
    { label: "Stage", value: STAGE_LABELS[startup.stage] },
    { label: "Location", value: startup.location },
    { label: "Team size", value: startup.teamSize && `${startup.teamSize} people` },
    { label: "Founded", value: startup.foundedYear },
    { label: "Published", value: startup.publishedAt && formatDate(startup.publishedAt) },
  ].filter((f) => f.value);

  return (
    <article className="flex flex-col gap-6">
      {editable && !isPublic(startup) && (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-warning/40 p-4">
          <div className="flex items-center gap-3 text-sm text-muted">
            <StatusBadge startup={startup} />
            {startup.isHidden
              ? "A moderator has hidden this startup from the catalog."
              : "Only you can see this page until you publish it."}
          </div>
          {!startup.isHidden && startup.status === "DRAFT" && (
            <ApiActionButton url={`/api/startups/${startup.id}/publish`} label="Publish" variant="primary" />
          )}
        </Card>
      )}

      <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <StartupLogo name={startup.name} logoUrl={startup.logoUrl} size="lg" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-fg">{startup.name}</h1>
            <p className="mt-1 text-lg text-muted">{startup.tagline}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="primary">{INDUSTRY_LABELS[startup.industry]}</Badge>
              <Badge>{STAGE_LABELS[startup.stage]}</Badge>
            </div>
          </div>
        </div>
        {editable && (
          <ButtonLink href={`/startups/${startup.slug}/edit`} variant="secondary" size="sm">
            Edit
          </ButtonLink>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-6">
          <h2 className="mb-3 font-semibold text-fg">About</h2>
          <div className="whitespace-pre-line text-fg/90 leading-relaxed">{startup.description}</div>
        </Card>

        <aside className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3 p-5">
            <h2 className="font-semibold text-fg">Contact</h2>
            <a href={`mailto:${startup.contactEmail}`} className="text-sm text-primary hover:underline break-all">
              {startup.contactEmail}
            </a>
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-sm text-primary hover:underline"
              >
                {l.label} ↗
              </a>
            ))}
          </Card>

          <Card className="p-5">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt className="text-muted">{f.label}</dt>
                  <dd className="font-medium text-fg">{f.value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="flex items-center gap-3 p-5">
            {startup.owner.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={startup.owner.avatarUrl} alt="" className="size-10 rounded-full object-cover" />
            ) : (
              <div className="flex size-10 items-center justify-center rounded-full bg-surface-muted font-semibold text-muted">
                {startup.owner.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs text-muted">Founder</p>
              <p className="font-medium text-fg">{startup.owner.name}</p>
              {startup.owner.bio && <p className="mt-1 text-sm text-muted">{startup.owner.bio}</p>}
            </div>
          </Card>
        </aside>
      </div>
    </article>
  );
}
