// Правила доступа к стартапам. Без БД и server-only — их можно тестировать напрямую.
import type { Startup, User } from "@prisma/client";

export type Viewer = Pick<User, "id" | "role"> | null;

export const isPublic = (s: Pick<Startup, "status" | "isHidden">) =>
  s.status === "PUBLISHED" && !s.isHidden;

export const canEdit = (s: Pick<Startup, "ownerId">, viewer: Viewer) =>
  !!viewer && (viewer.id === s.ownerId || viewer.role === "ADMIN");

/** Черновик и скрытый стартап видят только владелец и админ (FR-23). */
export const canView = (s: Pick<Startup, "ownerId" | "status" | "isHidden">, viewer: Viewer) =>
  isPublic(s) || canEdit(s, viewer);
