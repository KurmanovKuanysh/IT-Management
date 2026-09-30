import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/guards";

// GET /api/me/startups — все свои стартапы, включая черновики (FR-14)
export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const startups = await db.startup.findMany({
    where: { ownerId: auth.value.id },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ startups });
}
