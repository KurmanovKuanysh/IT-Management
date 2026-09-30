import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StartupForm } from "@/components/startups/StartupForm";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { canEdit } from "@/lib/startups";

export const metadata: Metadata = { title: "Edit startup" };

export default async function EditStartupPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [startup, user] = await Promise.all([
    db.startup.findUnique({ where: { slug } }),
    getCurrentUser(),
  ]);
  if (!startup || !canEdit(startup, user)) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-fg">Edit {startup.name}</h1>
        <p className="text-sm text-muted">The page address stays the same after renaming.</p>
      </div>
      <StartupForm startup={startup} />
    </div>
  );
}
