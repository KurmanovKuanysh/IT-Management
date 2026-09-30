// Вызов нашего API из браузера. Ошибки приходят в формате из lib/api.ts.
export type ApiErrorBody = {
  error: { code: string; message: string; fields?: Record<string, string> };
};

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

export async function apiFetch<T>(
  url: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const hasBody = init.body !== undefined;
  const res = await fetch(url, {
    method: init.method ?? "GET",
    headers: hasBody ? { "Content-Type": "application/json" } : undefined,
    body: hasBody ? JSON.stringify(init.body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = (data as ApiErrorBody | null)?.error;
    throw new ApiRequestError(err?.message ?? "Something went wrong", res.status, err?.fields);
  }
  return data as T;
}

/** Только локальные пути: ?next=//evil.com не должен уводить на чужой сайт. */
export function safeNext(next: string | null | undefined, fallback = "/dashboard") {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
