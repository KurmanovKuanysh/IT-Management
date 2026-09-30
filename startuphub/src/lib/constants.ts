import type { Industry, Stage } from "@prisma/client";

export const INDUSTRY_LABELS: Record<Industry, string> = {
  FINTECH: "FinTech",
  EDTECH: "EdTech",
  HEALTHTECH: "HealthTech",
  ECOMMERCE: "E-commerce",
  AI_ML: "AI / ML",
  GREENTECH: "GreenTech",
  GAMING: "Gaming",
  SOCIAL: "Social",
  LOGISTICS: "Logistics",
  OTHER: "Other",
};

export const STAGE_LABELS: Record<Stage, string> = {
  IDEA: "Idea",
  PROTOTYPE: "Prototype",
  MVP: "MVP",
  EARLY_REVENUE: "Early revenue",
  GROWTH: "Growth",
};
