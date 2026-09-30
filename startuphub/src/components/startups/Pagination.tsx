import { ButtonLink } from "@/components/ui";
import type { CatalogQuery } from "@/lib/validation/startup";

function pageHref(query: CatalogQuery, page: number) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.industry) params.set("industry", query.industry);
  if (query.stage) params.set("stage", query.stage);
  if (query.sort !== "new") params.set("sort", query.sort);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/startups?${qs}` : "/startups";
}

export function Pagination({ query, totalPages }: { query: CatalogQuery; totalPages: number }) {
  if (totalPages <= 1) return null;
  const { page } = query;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-3">
      {page > 1 ? (
        <ButtonLink href={pageHref(query, page - 1)} variant="secondary" size="sm">
          ← Previous
        </ButtonLink>
      ) : (
        <span className="w-24" />
      )}
      <span className="text-sm text-muted">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <ButtonLink href={pageHref(query, page + 1)} variant="secondary" size="sm">
          Next →
        </ButtonLink>
      ) : (
        <span className="w-24" />
      )}
    </nav>
  );
}
