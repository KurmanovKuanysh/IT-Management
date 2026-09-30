import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApiActionButton } from "@/components/common/ApiActionButton";
import { StartupLogo } from "@/components/startups/StartupLogo";
import { StatusBadge } from "@/components/startups/StatusBadge";
import { ButtonLink, Card, EmptyState } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "My startups" };

type Props = { searchParams: Promise<{ created?: string }> };

// «Мои стартапы» (FR-14): все свои стартапы, включая черновики.
export default async function DashboardPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { created } = await searchParams;

  const startups = await db.startup.findMany({
    where: { ownerId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg">My startups</h1>
          <p className="text-sm text-muted">Signed in as {user.email}</p>
        </div>
        <ButtonLink href="/startups/new">New startup</ButtonLink>
      </div>

      {created && (
        <p role="status" className="rounded-control bg-success/10 px-4 py-3 text-sm text-success">
          Draft saved. Press &quot;Publish&quot; to show it in the catalog.
        </p>
      )}

      {startups.length === 0 ? (
        <EmptyState
          title="You haven't added any startups yet"
          text="Create a draft and publish it when it's ready."
          action={<ButtonLink href="/startups/new">Create your first startup</ButtonLink>}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {startups.map((s) => (
            <li key={s.id}>
              <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <StartupLogo name={s.name} logoUrl={s.logoUrl} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/startups/${s.slug}`} className="truncate font-semibold text-fg hover:underline">
                        {s.name}
                      </Link>
                      <StatusBadge startup={s} />
                    </div>
                    <p className="text-xs text-muted">Updated {formatDate(s.updatedAt)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <ButtonLink href={`/startups/${s.slug}/edit`} variant="secondary" size="sm">
                    Edit
                  </ButtonLink>
                  {s.status === "DRAFT" ? (
                    <ApiActionButton url={`/api/startups/${s.id}/publish`} label="Publish" variant="primary" />
                  ) : (
                    <ApiActionButton url={`/api/startups/${s.id}/unpublish`} label="Unpublish" />
                  )}
                  <ApiActionButton
                    url={`/api/startups/${s.id}`}
                    method="DELETE"
                    label="Delete"
                    variant="ghost"
                    confirmLabel="Click again to delete"
                  />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
