import { NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { db } from "@/lib/db";
import { findById, requireAdmin } from "@/lib/guards";

const ACTIONS = { hide: true, unhide: false } as const;

// POST /api/admin/startups/:id/hide · /unhide (FR-26)
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string; action: string }> },
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id, action } = await params;
  if (!(action in ACTIONS)) return apiError("NOT_FOUND", "Unknown action");
  const existing = await findById(id);
  if (!existing) return apiError("NOT_FOUND", "Startup not found");

  const startup = await db.startup.update({
    where: { id: existing.id },
    data: { isHidden: ACTIONS[action as keyof typeof ACTIONS] },
  });
  return NextResponse.json({ startup });
}
