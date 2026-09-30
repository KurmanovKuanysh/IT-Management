import "server-only";
import { cookies } from "next/headers";
import type { User } from "@prisma/client";
import { db } from "./db";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession, verifySession } from "./jwt";

export type PublicUser = Pick<User, "id" | "email" | "name" | "bio" | "avatarUrl" | "role">;

export function toPublicUser(user: User): PublicUser {
  const { id, email, name, bio, avatarUrl, role } = user;
  return { id, email, name, bio, avatarUrl, role };
}

export async function startSession(user: Pick<User, "id" | "role">) {
  const token = await signSession({ sub: user.id, role: user.role });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/**
 * Текущий пользователь из cookie. Каждый раз читает БД: роль и блокировка
 * могут измениться после выдачи токена, а JWT об этом не узнает.
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const user = await db.user.findUnique({ where: { id: session.sub } });
  if (!user || user.isBlocked) return null;
  return user;
}
