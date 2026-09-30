import { ButtonLink, Card, EmptyState, Input } from "@/components/ui";
import { StartupCard } from "@/components/startups/StartupCard";
import { db } from "@/lib/db";

// Главная (FR-25): hero, поиск, 6 последних стартапов, призыв опубликовать свой.
export default async function HomePage() {
  const where = { status: "PUBLISHED", isHidden: false } as const;
  const [latest, total] = await Promise.all([
    db.startup.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 6,
    }),
    db.startup.count({ where }),
  ]);

  return (
    <div className="flex flex-col gap-16">
      <section className="pt-8 text-center sm:pt-14">
        <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight text-fg sm:text-5xl">
          Discover startups worth following
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
          StartupHub is where founders publish their projects and everyone else finds them.
        </p>
        <form action="/startups" role="search" className="mx-auto mt-8 flex max-w-xl gap-2">
          <label htmlFor="home-q" className="sr-only">
            Search startups
          </label>
          <Input id="home-q" name="q" type="search" placeholder="Search by name or idea…" />
          <button
            type="submit"
            className="h-11 shrink-0 rounded-control bg-primary px-5 text-sm font-medium text-primary-fg hover:bg-primary-hover"
          >
            Search
          </button>
        </form>
        <p className="mt-3 text-sm text-muted">{total} startups published</p>
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-bold text-fg">Latest startups</h2>
          <ButtonLink href="/startups" variant="ghost" size="sm">
            View all →
          </ButtonLink>
        </div>
        {latest.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((s) => (
              <StartupCard key={s.id} startup={s} />
            ))}
          </div>
        ) : (
          <EmptyState title="No startups yet" text="Be the first to publish yours." />
        )}
      </section>

      <Card className="flex flex-col items-center gap-4 p-8 text-center sm:p-12">
        <h2 className="text-2xl font-bold text-fg">Building something?</h2>
        <p className="max-w-lg text-muted">
          Create a profile for your startup in a few minutes and let people find it.
        </p>
        <ButtonLink href="/startups/new">Publish your startup</ButtonLink>
      </Card>
    </div>
  );
}
