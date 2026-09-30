import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/lib/validation/auth";
import { catalogQuerySchema, startupSchema } from "@/lib/validation/startup";

const validStartup = {
  name: "EcoRide",
  tagline: "Shared e-scooters for campuses",
  description: "x".repeat(60),
  industry: "GREENTECH",
  stage: "MVP",
  contactEmail: "Team@EcoRide.KZ",
  logoUrl: "",
  websiteUrl: "https://ecoride.kz",
  pitchDeckUrl: "",
  location: "",
  teamSize: "4",
  foundedYear: "",
};

describe("registerSchema", () => {
  it("normalizes email", () => {
    const r = registerSchema.parse({ name: "Ann", email: " Ann@Mail.COM ", password: "12345678" });
    expect(r.email).toBe("ann@mail.com");
  });

  it("rejects short password and name", () => {
    const r = registerSchema.safeParse({ name: "A", email: "a@b.co", password: "123" });
    expect(r.success).toBe(false);
    expect(r.error?.issues.map((i) => i.path[0]).sort()).toEqual(["name", "password"]);
  });

  it("login requires a password", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
  });
});

describe("startupSchema", () => {
  it("turns empty optional fields into null and numbers into numbers", () => {
    const r = startupSchema.parse(validStartup);
    expect(r.logoUrl).toBeNull();
    expect(r.location).toBeNull();
    expect(r.foundedYear).toBeNull();
    expect(r.teamSize).toBe(4);
    expect(r.contactEmail).toBe("team@ecoride.kz");
  });

  it("rejects unknown industry, bad URL and short description", () => {
    const r = startupSchema.safeParse({
      ...validStartup,
      industry: "SPACE",
      websiteUrl: "ecoride",
      description: "too short",
    });
    expect(r.success).toBe(false);
    const fields = r.error?.issues.map((i) => i.path[0]);
    expect(fields).toEqual(expect.arrayContaining(["industry", "websiteUrl", "description"]));
  });

  it("rejects founded year in the future", () => {
    const next = new Date().getFullYear() + 1;
    expect(startupSchema.safeParse({ ...validStartup, foundedYear: String(next) }).success).toBe(false);
  });
});

describe("catalogQuerySchema", () => {
  it("falls back to defaults for garbage input", () => {
    expect(catalogQuerySchema.parse({ industry: "NOPE", stage: "x", sort: "rand", page: "-3" })).toEqual({
      q: "",
      industry: undefined,
      stage: undefined,
      sort: "new",
      page: 1,
    });
  });

  it("keeps valid filters", () => {
    const r = catalogQuerySchema.parse({ q: " bot ", industry: "AI_ML", stage: "MVP", sort: "name", page: "2" });
    expect(r).toEqual({ q: "bot", industry: "AI_ML", stage: "MVP", sort: "name", page: 2 });
  });
});
