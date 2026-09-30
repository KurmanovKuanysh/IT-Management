import { NextResponse, type NextRequest } from "next/server";
import { readJson, validationError } from "@/lib/api";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { listPublished, ownerSelect, uniqueSlug } from "@/lib/startups";
import { catalogQuerySchema, startupSchema } from "@/lib/validation/startup";

// GET /api/startups?q=&industry=&stage=&sort=&page= — только опубликованные (FR-15…20)
export async function GET(req: NextRequest) {
  const query = catalogQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));
  return NextResponse.json(await listPublished(query));
}

// POST /api/startups — новый стартап всегда создаётся черновиком (FR-08, FR-09)
export async function POST(req: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const parsed = startupSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);

  const startup = await db.startup.create({
    data: { ...parsed.data, slug: await uniqueSlug(parsed.data.name), ownerId: auth.value.id },
    include: { owner: ownerSelect },
  });
  return NextResponse.json({ startup }, { status: 201 });
}
