import { NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { db } from "@/lib/db";
import { isUuid, requireAdmin } from "@/lib/guards";

const ACTIONS = { block: true, unblock: false } as const;

// POST /api/admin/users/:id/block · /unblock (FR-27)
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string; action: string }> },
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id, action } = await params;
  if (!(action in ACTIONS)) return apiError("NOT_FOUND", "Unknown action");
  const target = isUuid(id) ? await db.user.findUnique({ where: { id } }) : null;
  if (!target) return apiError("NOT_FOUND", "User not found");
  // Админов не блокируем: так нельзя случайно закрыть доступ к модерации самому себе.
  if (target.role === "ADMIN") return apiError("FORBIDDEN", "Admins cannot be blocked");

  await db.user.update({
    where: { id },
    data: { isBlocked: ACTIONS[action as keyof typeof ACTIONS] },
  });
  return NextResponse.json({ ok: true });
}
