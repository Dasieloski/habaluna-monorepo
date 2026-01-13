-- CreateEnum
CREATE TYPE "SiteMode" AS ENUM ('LIVE', 'MAINTENANCE', 'COMING_SOON');

-- AlterTable
ALTER TABLE "ui_settings" ADD COLUMN     "siteMode" "SiteMode" NOT NULL DEFAULT 'LIVE';

