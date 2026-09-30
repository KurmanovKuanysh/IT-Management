import { ButtonLink } from "@/components/ui";

// Полная главная (последние стартапы, поиск) — FR-25, этап каталога.
export default function HomePage() {
  return (
    <section className="py-12 text-center sm:py-20">
      <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight text-fg sm:text-5xl">
        Discover startups worth following
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
        StartupHub is where founders publish their projects and everyone else finds them.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/startups">Browse startups</ButtonLink>
        <ButtonLink href="/startups/new" variant="secondary">
          Publish your startup
        </ButtonLink>
      </div>
    </section>
  );
}
