import type { Metadata } from "next";
import { ButtonLink, EmptyState } from "@/components/ui";
import { CatalogFilters } from "@/components/startups/CatalogFilters";
import { Pagination } from "@/components/startups/Pagination";
import { StartupCard } from "@/components/startups/StartupCard";
import { listPublished } from "@/lib/startups";
import { catalogQuerySchema } from "@/lib/validation/startup";

export const metadata: Metadata = { title: "Startups" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// Каталог (FR-15…21): только опубликованные и не скрытые, 12 на страницу.
export default async function CatalogPage({ searchParams }: Props) {
  const raw = await searchParams;
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const query = catalogQuerySchema.parse({
    q: first(raw.q) ?? "",
    industry: first(raw.industry) || undefined,
    stage: first(raw.stage) || undefined,
    sort: first(raw.sort),
    page: first(raw.page),
  });
  const result = await listPublished(query);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-fg">Startups</h1>
        <p className="text-sm text-muted">
          {result.total} {result.total === 1 ? "startup" : "startups"} found
        </p>
      </div>

      <CatalogFilters query={query} />

      {result.items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((s) => (
            <StartupCard key={s.id} startup={s} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No startups found"
          text="Try another search term or remove some filters."
          action={
            <ButtonLink href="/startups" variant="secondary">
              Reset filters
            </ButtonLink>
          }
        />
      )}

      <Pagination query={query} totalPages={result.totalPages} />
    </div>
  );
}
