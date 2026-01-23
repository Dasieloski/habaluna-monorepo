-- CreateEnum
CREATE TYPE "ThemeType" AS ENUM ('CHRISTMAS', 'VALENTINES', 'MOTHERS_DAY', 'EASTER', 'HALLOWEEN', 'NEW_YEAR', 'SUMMER', 'WINTER', 'SPRING', 'AUTUMN');

-- CreateEnum
CREATE TYPE "ThemeStatus" AS ENUM ('INACTIVE', 'ACTIVE', 'SCHEDULED');

-- CreateTable
CREATE TABLE "themes" (
    "id" TEXT NOT NULL,
    "type" "ThemeType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ThemeStatus" NOT NULL DEFAULT 'INACTIVE',
    "config" JSONB,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theme_schedules" (
    "id" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "theme_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "themes_type_key" ON "themes"("type");

-- CreateIndex
CREATE INDEX "themes_status_idx" ON "themes"("status");

-- CreateIndex
CREATE INDEX "themes_startDate_idx" ON "themes"("startDate");

-- CreateIndex
CREATE INDEX "themes_endDate_idx" ON "themes"("endDate");

-- CreateIndex
CREATE INDEX "theme_schedules_themeId_idx" ON "theme_schedules"("themeId");

-- CreateIndex
CREATE INDEX "theme_schedules_startDate_idx" ON "theme_schedules"("startDate");

-- CreateIndex
CREATE INDEX "theme_schedules_endDate_idx" ON "theme_schedules"("endDate");

-- AddForeignKey
ALTER TABLE "theme_schedules" ADD CONSTRAINT "theme_schedules_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "themes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

