import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ButtonLink } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";

export async function SiteHeader() {
  const user = await getCurrentUser();

  const links = [
    { href: "/startups", label: "Startups" },
    ...(user ? [{ href: "/dashboard", label: "My startups" }] : []),
    ...(user?.role === "ADMIN" ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
        <div className="flex items-center gap-5">
          <Link href="/" className="text-lg font-bold tracking-tight text-fg">
            Startup<span className="text-primary">Hub</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-muted">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-fg">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {user ? (
          <div className="flex items-center gap-2">
            <Link href="/profile" className="hidden text-sm text-muted hover:text-fg md:inline" title="My profile">
              {user.name}
            </Link>
            <ButtonLink href="/startups/new" size="sm">
              Publish
            </ButtonLink>
            <LogoutButton />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <ButtonLink href="/login" variant="ghost" size="sm">
              Log in
            </ButtonLink>
            <ButtonLink href="/register" size="sm">
              Sign up
            </ButtonLink>
          </div>
        )}
      </div>
    </header>
  );
}
