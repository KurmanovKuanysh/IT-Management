import { NextResponse } from "next/server";
import { readJson, validationError } from "@/lib/api";
import { toPublicUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { profileSchema } from "@/lib/validation/startup";

// PATCH /api/users/me — имя, био, аватар (FR-06)
export async function PATCH(req: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const parsed = profileSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);

  const user = await db.user.update({ where: { id: auth.value.id }, data: parsed.data });
  return NextResponse.json({ user: toPublicUser(user) });
}
