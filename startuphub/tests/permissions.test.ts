import { describe, expect, it } from "vitest";
import { safeNext } from "@/lib/client-api";
import { canEdit, canView, isPublic } from "@/lib/permissions";
import { slugify } from "@/lib/slug";

const owner = { id: "owner", role: "FOUNDER" as const };
const stranger = { id: "stranger", role: "FOUNDER" as const };
const admin = { id: "admin", role: "ADMIN" as const };

const draft = { ownerId: "owner", status: "DRAFT" as const, isHidden: false };
const published = { ...draft, status: "PUBLISHED" as const };
const hidden = { ...published, isHidden: true };

describe("startup permissions", () => {
  it("only published and not hidden startups are public", () => {
    expect(isPublic(published)).toBe(true);
    expect(isPublic(draft)).toBe(false);
    expect(isPublic(hidden)).toBe(false);
  });

  it("drafts and hidden startups are visible only to owner and admin", () => {
    for (const s of [draft, hidden]) {
      expect(canView(s, null)).toBe(false);
      expect(canView(s, stranger)).toBe(false);
      expect(canView(s, owner)).toBe(true);
      expect(canView(s, admin)).toBe(true);
    }
    expect(canView(published, null)).toBe(true);
  });

  it("only owner and admin can edit", () => {
    expect(canEdit(published, owner)).toBe(true);
    expect(canEdit(published, admin)).toBe(true);
    expect(canEdit(published, stranger)).toBe(false);
    expect(canEdit(published, null)).toBe(false);
  });
});

describe("slugify", () => {
  it("makes URL-safe slugs", () => {
    expect(slugify("FitTrack Pro!")).toBe("fittrack-pro");
    expect(slugify("  Café  Déjà vu ")).toBe("cafe-deja-vu");
    expect(slugify("Стартап")).toBe("startup");
  });
});

describe("safeNext", () => {
  it("allows only local paths", () => {
    expect(safeNext("/startups?q=ai")).toBe("/startups?q=ai");
    expect(safeNext("//evil.com")).toBe("/dashboard");
    expect(safeNext("https://evil.com")).toBe("/dashboard");
    expect(safeNext(null)).toBe("/dashboard");
  });
});
