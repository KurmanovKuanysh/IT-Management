import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { apiError, readJson, validationError } from "@/lib/api";
import { startSession, toPublicUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/validation/auth";

export async function POST(req: Request) {
  const parsed = registerSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);
  const { name, email, password } = parsed.data;

  try {
    const user = await db.user.create({
      data: { name, email, passwordHash: await hashPassword(password) },
    });
    await startSession(user);
    return NextResponse.json({ user: toPublicUser(user) }, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return apiError("CONFLICT", "This email is already registered", {
        email: "This email is already registered",
      });
    }
    throw e;
  }
}
