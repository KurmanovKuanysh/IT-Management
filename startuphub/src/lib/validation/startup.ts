import type { Industry, Stage } from "@prisma/client";
import { z } from "zod";
import { INDUSTRY_LABELS, STAGE_LABELS } from "../constants";

const INDUSTRIES = Object.keys(INDUSTRY_LABELS) as [Industry, ...Industry[]];
const STAGES = Object.keys(STAGE_LABELS) as [Stage, ...Stage[]];

// Пустое поле формы приходит как "" — в БД это null.
const emptyToNull = (v: unknown) => (typeof v === "string" && v.trim() === "") || v == null ? null : v;

const optionalUrl = z.preprocess(
  emptyToNull,
  z.string().trim().url("Enter a full URL, e.g. https://example.com").max(500).nullable(),
);

const optionalInt = (min: number, max: number) =>
  z.preprocess(
    (v) => {
      const value = emptyToNull(v);
      return value === null ? null : Number(value);
    },
    z
      .number({ invalid_type_error: "Enter a number" })
      .int("Enter a whole number")
      .min(min, `Must be at least ${min}`)
      .max(max, `Must be at most ${max}`)
      .nullable(),
  );

export const startupSchema = z.object({
  name: z.string().trim().min(2, "At least 2 characters").max(80, "At most 80 characters"),
  tagline: z.string().trim().min(10, "At least 10 characters").max(140, "At most 140 characters"),
  description: z
    .string()
    .trim()
    .min(50, "At least 50 characters")
    .max(5000, "At most 5000 characters"),
  industry: z.enum(INDUSTRIES, { errorMap: () => ({ message: "Choose an industry" }) }),
  stage: z.enum(STAGES, { errorMap: () => ({ message: "Choose a stage" }) }),
  contactEmail: z.string().trim().toLowerCase().email("Enter a valid email"),
  logoUrl: optionalUrl,
  websiteUrl: optionalUrl,
  pitchDeckUrl: optionalUrl,
  location: z.preprocess(emptyToNull, z.string().trim().max(80, "At most 80 characters").nullable()),
  teamSize: optionalInt(1, 1000),
  foundedYear: optionalInt(1990, new Date().getFullYear()),
});

export type StartupInput = z.infer<typeof startupSchema>;

export const profileSchema = z.object({
  name: z.string().trim().min(2, "At least 2 characters").max(50, "At most 50 characters"),
  bio: z.preprocess(emptyToNull, z.string().trim().max(300, "At most 300 characters").nullable()),
  avatarUrl: optionalUrl,
});

export type ProfileInput = z.infer<typeof profileSchema>;

/** Параметры каталога из URL. Неизвестные значения фильтров молча отбрасываются. */
export const catalogQuerySchema = z.object({
  q: z.string().trim().max(100).catch(""),
  industry: z.enum(INDUSTRIES).optional().catch(undefined),
  stage: z.enum(STAGES).optional().catch(undefined),
  sort: z.enum(["new", "name"]).catch("new"),
  page: z.coerce.number().int().min(1).max(1000).catch(1),
});

export type CatalogQuery = z.infer<typeof catalogQuerySchema>;
