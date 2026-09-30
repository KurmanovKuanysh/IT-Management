import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ButtonLink } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold tracking-tight text-fg">
            Startup<span className="text-primary">Hub</span>
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-muted sm:flex">
            <Link href="/startups" className="hover:text-fg">
              Startups
            </Link>
            {user?.role === "ADMIN" && (
              <Link href="/admin" className="hover:text-fg">
                Admin
              </Link>
            )}
          </nav>
        </div>

        {user ? (
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="hidden text-sm text-muted hover:text-fg sm:inline">
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
