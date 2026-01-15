-- This migration is written defensively because some environments may have been created via `prisma db push`
-- and could be missing tables/columns that now exist in schema.prisma.

-- Ensure pgcrypto is available (needed only if we have to backfill tokenHash from legacy token)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) refresh_tokens: create if missing; if exists with legacy "token" column, add/backfill "tokenHash".
DO $$
BEGIN
  IF to_regclass('public.refresh_tokens') IS NULL THEN
    -- CreateTable
    CREATE TABLE "refresh_tokens" (
      "id" TEXT NOT NULL,
      "tokenHash" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "expiresAt" TIMESTAMP(3) NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
    );

    -- CreateIndex
    CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");
    CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

    -- AddForeignKey
    ALTER TABLE "refresh_tokens"
      ADD CONSTRAINT "refresh_tokens_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  ELSE
    -- Table exists: ensure tokenHash column exists
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'refresh_tokens' AND column_name = 'tokenHash'
    ) THEN
      ALTER TABLE "refresh_tokens" ADD COLUMN "tokenHash" TEXT;
    END IF;

    -- If legacy "token" exists and tokenHash is null, backfill with sha256(token)
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'refresh_tokens' AND column_name = 'token'
    ) THEN
      UPDATE "refresh_tokens"
      SET "tokenHash" = encode(digest("token", 'sha256'), 'hex')
      WHERE "tokenHash" IS NULL AND "token" IS NOT NULL;
    END IF;

    -- Ensure tokenHash is NOT NULL for future rows (only if no nulls remain)
    IF NOT EXISTS (SELECT 1 FROM "refresh_tokens" WHERE "tokenHash" IS NULL) THEN
      ALTER TABLE "refresh_tokens" ALTER COLUMN "tokenHash" SET NOT NULL;
    END IF;

    -- Indexes/FK best-effort
    BEGIN
      CREATE UNIQUE INDEX IF NOT EXISTS "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");
    EXCEPTION WHEN others THEN
      -- ignore
    END;

    BEGIN
      CREATE INDEX IF NOT EXISTS "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");
    EXCEPTION WHEN others THEN
      -- ignore
    END;

    BEGIN
      ALTER TABLE "refresh_tokens"
        ADD CONSTRAINT "refresh_tokens_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "users"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
      -- already exists
    END;
  END IF;
END $$;

-- 2) Enum + marketing_email_logs table (create if missing)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MarketingEmailType') THEN
    CREATE TYPE "MarketingEmailType" AS ENUM ('ABANDONED_CART', 'REVIEW_REQUEST');
  END IF;

  IF to_regclass('public.marketing_email_logs') IS NULL THEN
    CREATE TABLE "marketing_email_logs" (
      "id" TEXT NOT NULL,
      "userId" TEXT,
      "email" TEXT NOT NULL,
      "type" "MarketingEmailType" NOT NULL,
      "dedupeKey" TEXT NOT NULL,
      "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "marketing_email_logs_pkey" PRIMARY KEY ("id")
    );

    CREATE UNIQUE INDEX "marketing_email_logs_type_dedupeKey_key" ON "marketing_email_logs"("type","dedupeKey");
    CREATE INDEX "marketing_email_logs_email_idx" ON "marketing_email_logs"("email");
    CREATE INDEX "marketing_email_logs_sentAt_idx" ON "marketing_email_logs"("sentAt");

    ALTER TABLE "marketing_email_logs"
      ADD CONSTRAINT "marketing_email_logs_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

