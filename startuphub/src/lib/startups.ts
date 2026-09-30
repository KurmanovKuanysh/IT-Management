import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { slugify } from "./slug";
import type { CatalogQuery } from "./validation/startup";

export const PAGE_SIZE = 12;

export const ownerSelect = { select: { id: true, name: true, avatarUrl: true, bio: true } } as const;

export type StartupWithOwner = Prisma.StartupGetPayload<{ include: { owner: typeof ownerSelect } }>;

export { canEdit, canView, isPublic } from "./permissions";

/** Slug из названия; при совпадении добавляется -2, -3… */
export async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  const taken = new Set(
    (await db.startup.findMany({ where: { slug: { startsWith: base } }, select: { slug: true } })).map(
      (s) => s.slug,
    ),
  );
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export async function listPublished(query: CatalogQuery) {
  const where: Prisma.StartupWhereInput = {
    status: "PUBLISHED",
    isHidden: false,
    industry: query.industry,
    stage: query.stage,
  };
  if (query.q) {
    where.OR = (["name", "tagline", "description"] as const).map((field) => ({
      [field]: { contains: query.q, mode: "insensitive" },
    }));
  }
  const orderBy: Prisma.StartupOrderByWithRelationInput[] =
    query.sort === "name" ? [{ name: "asc" }] : [{ publishedAt: "desc" }, { createdAt: "desc" }];

  const [total, items] = await db.$transaction([
    db.startup.count({ where }),
    db.startup.findMany({
      where,
      orderBy,
      skip: (query.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { owner: ownerSelect },
    }),
  ]);
  return {
    items,
    page: query.page,
    pageSize: PAGE_SIZE,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export function findBySlug(slug: string) {
  return db.startup.findUnique({ where: { slug }, include: { owner: ownerSelect } });
}
