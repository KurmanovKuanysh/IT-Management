import { NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { getCurrentUser, toPublicUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return apiError("UNAUTHORIZED", "Not signed in");
  return NextResponse.json({ user: toPublicUser(user) });
}
