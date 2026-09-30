import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <p className="text-5xl font-bold text-primary">404</p>
      <h1 className="text-xl font-semibold text-fg">Page not found</h1>
      <p className="max-w-sm text-muted">
        The page doesn&apos;t exist, or the startup hasn&apos;t been published yet.
      </p>
      <ButtonLink href="/startups" variant="secondary">
        Browse startups
      </ButtonLink>
    </div>
  );
}
