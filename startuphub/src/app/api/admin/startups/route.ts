import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { ownerSelect } from "@/lib/startups";

// GET /api/admin/startups?q= — все стартапы любого статуса (FR-26)
export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const startups = await db.startup.findMany({
    where: q ? { name: { contains: q, mode: "insensitive" } } : undefined,
    orderBy: { createdAt: "desc" },
    include: { owner: ownerSelect },
  });
  return NextResponse.json({ startups });
}
