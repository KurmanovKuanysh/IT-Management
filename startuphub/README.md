# StartupHub

Платформа, где основатели публикуют стартапы, а посетители находят их через каталог и поиск.
ТЗ: [`../docs/TZ-MVP-StartupHub.md`](../docs/TZ-MVP-StartupHub.md).

**Стек:** Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · PostgreSQL · Prisma 6 · JWT (jose) в httpOnly-cookie · Zod + React Hook Form.

## Запуск

Нужны Node.js 20+ и PostgreSQL 15+.

```bash
npm install
cp .env.example .env        # и задать JWT_SECRET (команда генерации в файле)
npm run db:start            # локальный Postgres на 5434 без Docker (Windows, Git Bash)
npm run db:migrate          # применить миграции
npm run db:seed             # админ + 2 основателя + 18 демо-стартапов
npm run dev                 # http://localhost:3000
```

Если Postgres у вас свой, пропустите `db:start` и укажите `DATABASE_URL` в `.env`.

Демо-аккаунты после seed:

| Роль | Email | Пароль |
|---|---|---|
| Admin | admin@startuphub.local | admin12345 |
| Founder | aigerim@startuphub.local | founder123 |
| Founder | daniyar@startuphub.local | founder123 |

## Скрипты

| Команда | Что делает |
|---|---|
| `npm run dev` / `build` / `start` | Разработка / сборка / прод-сервер |
| `npm run typecheck` · `npm run lint` | Проверка типов и линтер |
| `npm run db:start` · `db:stop` | Локальный Postgres из `scripts/devdb.sh` |
| `npm run db:migrate` | Новая миграция после изменения `prisma/schema.prisma` |
| `npm run db:seed` · `db:reset` | Демо-данные / пересоздать БД с нуля |

## Структура и разделение работы

```
prisma/                 схема, миграции, seed                  — Backend
src/app/api/            REST API (контракт — раздел 7 ТЗ)      — Backend
src/lib/                БД, авторизация, валидация (Zod)       — Backend
src/middleware.ts       защита закрытых страниц                — Backend
src/app/(public|auth|app)/  страницы                           — Frontend
src/components/         компоненты страниц                     — Frontend
src/components/ui/      UI-кит: Button, Input, Field, Card…    — Дизайн
src/styles/tokens.css   цвета, радиусы, тени, тёмная тема      — Дизайн
```

**Дизайн отделён от логики.** Весь внешний вид задаётся в `src/styles/tokens.css`
(цвета, радиусы, тени, тёмная тема) и в `src/components/ui/`. Страницы используют
только эти компоненты и токен-классы (`bg-surface`, `text-muted`, `bg-primary`…),
без захардкоженных цветов. Чтобы перекрасить сайт, достаточно поменять токены;
чтобы изменить вид кнопки или поля — её файл в `ui/`. Логику при этом трогать не нужно.
