import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEditableStartup } from "@/lib/guards";

// POST /api/startups/:id/unpublish (FR-10)
export async function POST(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const guard = await requireEditableStartup((await params).key);
  if (!guard.ok) return guard.response;
  const startup = await db.startup.update({
    where: { id: guard.value.startup.id },
    data: { status: "DRAFT" },
  });
  return NextResponse.json({ startup });
}
