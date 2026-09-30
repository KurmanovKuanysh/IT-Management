import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ButtonLink, Card } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "My startups" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Список стартапов появится на этапе CRUD (FR-14).
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg">My startups</h1>
          <p className="text-sm text-muted">Signed in as {user.email}</p>
        </div>
        <ButtonLink href="/startups/new">New startup</ButtonLink>
      </div>
      <Card className="p-10 text-center">
        <p className="font-medium text-fg">You haven&apos;t added any startups yet</p>
        <p className="mt-1 text-sm text-muted">Create a draft and publish it when it&apos;s ready.</p>
      </Card>
    </div>
  );
}
