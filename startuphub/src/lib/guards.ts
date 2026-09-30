import "server-only";
import type { Startup, User } from "@prisma/client";
import { apiError } from "./api";
import { getCurrentUser } from "./auth";
import { db } from "./db";
import { canEdit } from "./startups";

type Guarded<T> = { ok: true; value: T } | { ok: false; response: Response };

export async function requireUser(): Promise<Guarded<User>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, response: apiError("UNAUTHORIZED", "Please log in") };
  return { ok: true, value: user };
}

export async function requireAdmin(): Promise<Guarded<User>> {
  const res = await requireUser();
  if (res.ok && res.value.role !== "ADMIN") {
    return { ok: false, response: apiError("FORBIDDEN", "Admins only") };
  }
  return res;
}

/** Стартап по id, который текущий пользователь вправе менять (владелец или админ). */
export async function requireEditableStartup(
  id: string,
): Promise<Guarded<{ user: User; startup: Startup }>> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const startup = await findById(id);
  if (!startup) return { ok: false, response: apiError("NOT_FOUND", "Startup not found") };
  if (!canEdit(startup, auth.value)) {
    return { ok: false, response: apiError("FORBIDDEN", "You can only change your own startups") };
  }
  return { ok: true, value: { user: auth.value, startup } };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Не-UUID в поле @db.Uuid Postgres отвергает ошибкой — для нас это просто «не найдено». */
export function findById(id: string) {
  return UUID.test(id) ? db.startup.findUnique({ where: { id } }) : Promise.resolve(null);
}

export const isUuid = (id: string) => UUID.test(id);
