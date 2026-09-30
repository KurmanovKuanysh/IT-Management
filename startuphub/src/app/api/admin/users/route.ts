import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";

// GET /api/admin/users (FR-27)
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isBlocked: true,
      createdAt: true,
      _count: { select: { startups: true } },
    },
  });
  return NextResponse.json({ users });
}
