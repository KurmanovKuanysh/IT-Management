import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiActionButton } from "@/components/common/ApiActionButton";
import { StatusBadge } from "@/components/startups/StatusBadge";
import { Badge, Button, Card, EmptyState, Input, cn } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Admin" };

type Props = { searchParams: Promise<{ tab?: string; q?: string }> };

// Модерация (FR-26, FR-27). Middleware уже отсёк не-админов по токену,
// здесь — проверка по БД на случай, если роль изменилась после входа.
export default async function AdminPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") notFound();

  const { tab: rawTab, q: rawQ } = await searchParams;
  const tab = rawTab === "users" ? "users" : "startups";
  const q = rawQ?.trim() ?? "";

  const tabs = [
    { id: "startups", label: "Startups", count: await db.startup.count() },
    { id: "users", label: "Users", count: await db.user.count() },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-fg">Moderation</h1>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav className="flex gap-1 rounded-control bg-surface-muted p-1" aria-label="Admin sections">
          {tabs.map((t) => (
            <Link
              key={t.id}
              href={`/admin?tab=${t.id}`}
              aria-current={tab === t.id ? "page" : undefined}
              className={cn(
                "rounded-control px-4 py-1.5 text-sm font-medium",
                tab === t.id ? "bg-surface text-fg shadow-card" : "text-muted hover:text-fg",
              )}
            >
              {t.label} <span className="text-muted">{t.count}</span>
            </Link>
          ))}
        </nav>
        <form action="/admin" className="flex gap-2">
          <input type="hidden" name="tab" value={tab} />
          <label htmlFor="admin-q" className="sr-only">
            Search
          </label>
          <Input
            id="admin-q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder={tab === "users" ? "Name or email…" : "Startup name…"}
            className="w-56"
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </div>

      {tab === "startups" ? <StartupsTable q={q} /> : <UsersTable q={q} />}
    </div>
  );
}

const th = "px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted";
const td = "px-4 py-3 align-middle";

async function StartupsTable({ q }: { q: string }) {
  const startups = await db.startup.findMany({
    where: q ? { name: { contains: q, mode: "insensitive" } } : undefined,
    orderBy: { createdAt: "desc" },
    include: { owner: { select: { name: true, email: true } } },
  });
  if (startups.length === 0) return <EmptyState title="Nothing found" />;

  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="border-b border-border">
          <tr>
            <th className={th}>Startup</th>
            <th className={th}>Owner</th>
            <th className={th}>Status</th>
            <th className={th}>Created</th>
            <th className={cn(th, "text-right")}>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {startups.map((s) => (
            <tr key={s.id}>
              <td className={td}>
                <Link href={`/startups/${s.slug}`} className="font-medium text-fg hover:underline">
                  {s.name}
                </Link>
              </td>
              <td className={cn(td, "text-muted")}>{s.owner.email}</td>
              <td className={td}>
                <StatusBadge startup={s} />
              </td>
              <td className={cn(td, "text-muted")}>{formatDate(s.createdAt)}</td>
              <td className={cn(td, "text-right")}>
                <div className="flex justify-end gap-2">
                  <ApiActionButton
                    url={`/api/admin/startups/${s.id}/${s.isHidden ? "unhide" : "hide"}`}
                    label={s.isHidden ? "Unhide" : "Hide"}
                  />
                  <ApiActionButton
                    url={`/api/startups/${s.id}`}
                    method="DELETE"
                    label="Delete"
                    variant="ghost"
                    confirmLabel="Confirm delete"
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

async function UsersTable({ q }: { q: string }) {
  const users = await db.user.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { startups: true } } },
  });
  if (users.length === 0) return <EmptyState title="Nothing found" />;

  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="border-b border-border">
          <tr>
            <th className={th}>User</th>
            <th className={th}>Role</th>
            <th className={th}>Startups</th>
            <th className={th}>Joined</th>
            <th className={cn(th, "text-right")}>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((u) => (
            <tr key={u.id}>
              <td className={td}>
                <p className="font-medium text-fg">{u.name}</p>
                <p className="text-xs text-muted">{u.email}</p>
              </td>
              <td className={td}>
                <div className="flex gap-2">
                  <Badge tone={u.role === "ADMIN" ? "primary" : "neutral"}>
                    {u.role === "ADMIN" ? "Admin" : "Founder"}
                  </Badge>
                  {u.isBlocked && <Badge tone="danger">Blocked</Badge>}
                </div>
              </td>
              <td className={cn(td, "text-muted")}>{u._count.startups}</td>
              <td className={cn(td, "text-muted")}>{formatDate(u.createdAt)}</td>
              <td className={cn(td, "text-right")}>
                {u.role !== "ADMIN" && (
                  <ApiActionButton
                    url={`/api/admin/users/${u.id}/${u.isBlocked ? "unblock" : "block"}`}
                    label={u.isBlocked ? "Unblock" : "Block"}
                    variant={u.isBlocked ? "secondary" : "ghost"}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
