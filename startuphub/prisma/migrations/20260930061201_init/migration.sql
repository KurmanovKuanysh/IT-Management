-- CreateEnum
CREATE TYPE "Role" AS ENUM ('FOUNDER', 'ADMIN');

-- CreateEnum
CREATE TYPE "StartupStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "Industry" AS ENUM ('FINTECH', 'EDTECH', 'HEALTHTECH', 'ECOMMERCE', 'AI_ML', 'GREENTECH', 'GAMING', 'SOCIAL', 'LOGISTICS', 'OTHER');

-- CreateEnum
CREATE TYPE "Stage" AS ENUM ('IDEA', 'PROTOTYPE', 'MVP', 'EARLY_REVENUE', 'GROWTH');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "role" "Role" NOT NULL DEFAULT 'FOUNDER',
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Startup" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "industry" "Industry" NOT NULL,
    "stage" "Stage" NOT NULL,
    "logoUrl" TEXT,
    "websiteUrl" TEXT,
    "pitchDeckUrl" TEXT,
    "contactEmail" TEXT NOT NULL,
    "location" TEXT,
    "teamSize" INTEGER,
    "foundedYear" INTEGER,
    "status" "StartupStatus" NOT NULL DEFAULT 'DRAFT',
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" UUID NOT NULL,

    CONSTRAINT "Startup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Startup_slug_key" ON "Startup"("slug");

-- CreateIndex
CREATE INDEX "Startup_status_isHidden_createdAt_idx" ON "Startup"("status", "isHidden", "createdAt");

-- CreateIndex
CREATE INDEX "Startup_industry_idx" ON "Startup"("industry");

-- CreateIndex
CREATE INDEX "Startup_stage_idx" ON "Startup"("stage");

-- CreateIndex
CREATE INDEX "Startup_ownerId_idx" ON "Startup"("ownerId");

-- AddForeignKey
ALTER TABLE "Startup" ADD CONSTRAINT "Startup_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
