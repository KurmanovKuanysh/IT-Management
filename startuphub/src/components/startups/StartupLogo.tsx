import { cn } from "@/components/ui";

/** Логотип по ссылке или буква-заглушка. Обычный <img>: логотипы лежат на любых доменах. */
export function StartupLogo({
  name,
  logoUrl,
  size = "md",
}: {
  name: string;
  logoUrl: string | null;
  size?: "md" | "lg";
}) {
  const box = size === "lg" ? "size-20 text-3xl" : "size-12 text-lg";
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={`${name} logo`}
        className={cn(box, "shrink-0 rounded-card border border-border bg-surface object-cover")}
      />
    );
  }
  return (
    <div
      aria-hidden
      className={cn(
        box,
        "flex shrink-0 items-center justify-center rounded-card bg-primary/10 font-bold text-primary",
      )}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
