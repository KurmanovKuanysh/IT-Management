import { NextResponse } from "next/server";
import { apiError, readJson, validationError } from "@/lib/api";
import { startSession, toPublicUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validation/auth";

// Хеш-заглушка: сравнение идёт и для несуществующего email,
// чтобы по времени ответа нельзя было узнать, зарегистрирован ли адрес.
const DUMMY_HASH = "$2b$10$zqatfZQzQ70tQKDcETr6XeZUAc/VHG0zgLZ2g9mSdp.fr/y0JK6iy";

export async function POST(req: Request) {
  const parsed = loginSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);
  const { email, password } = parsed.data;

  const user = await db.user.findUnique({ where: { email } });
  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) return apiError("UNAUTHORIZED", "Invalid email or password");
  if (user.isBlocked) return apiError("FORBIDDEN", "This account has been blocked");

  await startSession(user);
  return NextResponse.json({ user: toPublicUser(user) });
}
