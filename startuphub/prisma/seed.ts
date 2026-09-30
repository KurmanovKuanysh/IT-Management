// Демо-данные: админ, два основателя и 18 стартапов.
// Повторный запуск безопасен: пользователи и стартапы обновляются по email/slug.
import { PrismaClient, type Industry, type Stage, type StartupStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { slugify } from "../src/lib/slug";

const db = new PrismaClient();

type Demo = [name: string, tagline: string, industry: Industry, stage: Stage, location: string];

const STARTUPS: Demo[] = [
  ["EcoRide", "Shared e-scooters for university campuses", "GREENTECH", "MVP", "Almaty, KZ"],
  ["StudyBuddy", "Find a study partner for any course in minutes", "EDTECH", "PROTOTYPE", "Astana, KZ"],
  ["PayLite", "Split bills and pay friends without fees", "FINTECH", "EARLY_REVENUE", "Almaty, KZ"],
  ["MediQueue", "Online queue for city clinics", "HEALTHTECH", "MVP", "Shymkent, KZ"],
  ["CraftMarket", "Marketplace for handmade goods from Central Asia", "ECOMMERCE", "GROWTH", "Almaty, KZ"],
  ["LinguaBot", "AI tutor that speaks Kazakh, Russian and English", "AI_ML", "PROTOTYPE", "Astana, KZ"],
  ["FarmLink", "Connects farmers directly with restaurants", "LOGISTICS", "IDEA", "Taraz, KZ"],
  ["PixelQuest", "Educational mobile game about the history of the Silk Road", "GAMING", "MVP", "Almaty, KZ"],
  ["CampusHub", "Social network for student clubs and events", "SOCIAL", "EARLY_REVENUE", "Almaty, KZ"],
  ["SolarNest", "Rooftop solar panels on subscription", "GREENTECH", "IDEA", "Karaganda, KZ"],
  ["InvoiceAI", "Reads invoices and fills accounting forms automatically", "AI_ML", "MVP", "Astana, KZ"],
  ["FitTrack Pro", "Workout plans that adapt to your progress", "HEALTHTECH", "GROWTH", "Almaty, KZ"],
  ["QuickShip", "Same-day delivery for small online shops", "LOGISTICS", "EARLY_REVENUE", "Almaty, KZ"],
  ["CodeCamp KZ", "Project-based coding bootcamp for teenagers", "EDTECH", "GROWTH", "Astana, KZ"],
  ["RentEasy", "Rent anything from your neighbours", "ECOMMERCE", "PROTOTYPE", "Almaty, KZ"],
  ["MicroInvest", "Invest in local businesses from 1000 tenge", "FINTECH", "IDEA", "Almaty, KZ"],
  ["VolunteerMap", "Find volunteering opportunities near you", "SOCIAL", "MVP", "Pavlodar, KZ"],
  ["ScrapSense", "Computer vision that sorts recyclables", "OTHER", "PROTOTYPE", "Aktobe, KZ"],
];

function description(name: string, tagline: string) {
  return (
    `${name}: ${tagline.toLowerCase()}.\n\n` +
    `We started ${name} after seeing the problem first-hand. Our team is building a simple product ` +
    `that solves it without extra complexity. Right now we are looking for early users, mentors and ` +
    `partners who want to help us grow.`
  );
}

async function upsertUser(email: string, name: string, password: string, role: "ADMIN" | "FOUNDER") {
  const passwordHash = await bcrypt.hash(password, 10);
  return db.user.upsert({
    where: { email },
    update: { name, role, passwordHash },
    create: { email, name, role, passwordHash },
  });
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@startuphub.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin12345";

  await upsertUser(adminEmail, "Admin", adminPassword, "ADMIN");
  const founders = [
    await upsertUser("aigerim@startuphub.local", "Aigerim Sadykova", "founder123", "FOUNDER"),
    await upsertUser("daniyar@startuphub.local", "Daniyar Omarov", "founder123", "FOUNDER"),
  ];

  const now = Date.now();
  for (const [i, [name, tagline, industry, stage, location]] of STARTUPS.entries()) {
    // Последние два — черновики: на них проверяется, что DRAFT не попадает в каталог.
    const status: StartupStatus = i >= STARTUPS.length - 2 ? "DRAFT" : "PUBLISHED";
    const createdAt = new Date(now - i * 36 * 60 * 60 * 1000);
    const slug = slugify(name);
    const data = {
      name,
      tagline,
      description: description(name, tagline),
      industry,
      stage,
      location,
      contactEmail: `hello@${slug}.example`,
      websiteUrl: `https://${slug}.example`,
      teamSize: 2 + (i % 6),
      foundedYear: 2022 + (i % 4),
      status,
      publishedAt: status === "PUBLISHED" ? createdAt : null,
      ownerId: founders[i % founders.length].id,
    };
    await db.startup.upsert({ where: { slug }, update: data, create: { ...data, slug, createdAt } });
  }

  console.log(`Seed done: admin ${adminEmail}, 2 founders (password founder123), ${STARTUPS.length} startups`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
