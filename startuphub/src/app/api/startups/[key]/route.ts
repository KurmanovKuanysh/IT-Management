import { NextResponse } from "next/server";
import { apiError, readJson, validationError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireEditableStartup } from "@/lib/guards";
import { canView, findBySlug, ownerSelect } from "@/lib/startups";
import { startupSchema } from "@/lib/validation/startup";

// Один сегмент на оба случая: GET принимает slug, PATCH и DELETE — id.
type Ctx = { params: Promise<{ key: string }> };

// GET /api/startups/:slug
export async function GET(_req: Request, { params }: Ctx) {
  const { key: slug } = await params;
  const startup = await findBySlug(slug);
  // Для чужого черновика — 404, а не 403: не раскрываем, что такой slug существует.
  if (!startup || !canView(startup, await getCurrentUser())) {
    return apiError("NOT_FOUND", "Startup not found");
  }
  return NextResponse.json({ startup });
}

// PATCH /api/startups/:id — slug не меняется, чтобы старые ссылки продолжали работать
export async function PATCH(req: Request, { params }: Ctx) {
  const guard = await requireEditableStartup((await params).key);
  if (!guard.ok) return guard.response;

  const parsed = startupSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);

  const startup = await db.startup.update({
    where: { id: guard.value.startup.id },
    data: parsed.data,
    include: { owner: ownerSelect },
  });
  return NextResponse.json({ startup });
}

// DELETE /api/startups/:id
export async function DELETE(_req: Request, { params }: Ctx) {
  const guard = await requireEditableStartup((await params).key);
  if (!guard.ok) return guard.response;
  await db.startup.delete({ where: { id: guard.value.startup.id } });
  return NextResponse.json({ ok: true });
}
