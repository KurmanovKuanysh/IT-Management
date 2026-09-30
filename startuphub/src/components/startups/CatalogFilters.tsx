import Link from "next/link";
import { Button, Input, Select } from "@/components/ui";
import { INDUSTRY_LABELS, STAGE_LABELS } from "@/lib/constants";
import type { CatalogQuery } from "@/lib/validation/startup";

/**
 * Обычная GET-форма: фильтры попадают в URL (FR-20), страница рендерится
 * на сервере и работает даже без JavaScript.
 */
export function CatalogFilters({ query }: { query: CatalogQuery }) {
  const hasFilters = !!(query.q || query.industry || query.stage || query.sort !== "new");

  return (
    <form
      action="/startups"
      role="search"
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_180px_180px_160px_auto]"
    >
      <label className="sr-only" htmlFor="q">
        Search
      </label>
      <Input id="q" name="q" type="search" placeholder="Search startups…" defaultValue={query.q} />

      <label className="sr-only" htmlFor="industry">
        Industry
      </label>
      <Select id="industry" name="industry" defaultValue={query.industry ?? ""}>
        <option value="">All industries</option>
        {Object.entries(INDUSTRY_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <label className="sr-only" htmlFor="stage">
        Stage
      </label>
      <Select id="stage" name="stage" defaultValue={query.stage ?? ""}>
        <option value="">All stages</option>
        {Object.entries(STAGE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <label className="sr-only" htmlFor="sort">
        Sort
      </label>
      <Select id="sort" name="sort" defaultValue={query.sort}>
        <option value="new">Newest first</option>
        <option value="name">Name A–Z</option>
      </Select>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          Search
        </Button>
        {hasFilters && (
          <Link
            href="/startups"
            className="inline-flex h-11 items-center px-2 text-sm text-muted hover:text-fg"
          >
            Reset
          </Link>
        )}
      </div>
    </form>
  );
}
