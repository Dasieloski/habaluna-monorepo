-- Enable extension used by gen_random_uuid() if not present (Railway Postgres usually has it)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateTable
CREATE TABLE "media" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "filename" TEXT,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "data" BYTEA NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "media_createdAt_idx" ON "media"("createdAt");

