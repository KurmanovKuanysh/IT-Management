import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/jwt";

// Первая линия защиты: без валидного токена на закрытые страницы не пускаем.
// /login и /register сами уводят вошедшего пользователя: middleware не знает о
// блокировке, и редирект отсюда зациклил бы заблокированного на /dashboard.
// Окончательная проверка прав (блокировка, владелец) — на сервере, в страницах и API.
const PRIVATE = [/^\/dashboard/, /^\/profile/, /^\/startups\/new$/, /^\/startups\/[^/]+\/edit$/];
const ADMIN = [/^\/admin/];

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);

  const needsAdmin = ADMIN.some((re) => re.test(pathname));
  const needsAuth = needsAdmin || PRIVATE.some((re) => re.test(pathname));
  if (needsAuth && !session) {
    const login = new URL("/login", req.url);
    login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }
  if (needsAdmin && session?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/startups/:path*", "/admin/:path*"],
};
