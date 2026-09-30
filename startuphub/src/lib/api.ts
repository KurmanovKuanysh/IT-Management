import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "BAD_REQUEST";

const STATUS: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

export function apiError(
  code: ErrorCode,
  message: string,
  fields?: Record<string, string>,
) {
  return NextResponse.json({ error: { code, message, fields } }, { status: STATUS[code] });
}

export function validationError(error: ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    fields[key] ??= issue.message;
  }
  return apiError("VALIDATION_ERROR", "Please check the highlighted fields", fields);
}

/** Тело запроса как JSON; при битом JSON — undefined, чтобы валидация вернула 400. */
export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return undefined;
  }
}
