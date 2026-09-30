import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEditableStartup } from "@/lib/guards";

// POST /api/startups/:id/publish (FR-10)
export async function POST(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const guard = await requireEditableStartup((await params).key);
  if (!guard.ok) return guard.response;
  const { startup: current } = guard.value;
  const startup = await db.startup.update({
    where: { id: current.id },
    // Дата первой публикации сохраняется: повторная публикация не поднимает стартап наверх.
    data: { status: "PUBLISHED", publishedAt: current.publishedAt ?? new Date() },
  });
  return NextResponse.json({ startup });
}
