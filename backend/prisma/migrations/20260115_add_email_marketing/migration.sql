-- Email marketing: subscribers + campaigns + sends
-- Defensive migration (works if some environments were created with db push).

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NewsletterSubscriberStatus') THEN
    CREATE TYPE "NewsletterSubscriberStatus" AS ENUM ('SUBSCRIBED', 'UNSUBSCRIBED');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EmailCampaignStatus') THEN
    CREATE TYPE "EmailCampaignStatus" AS ENUM ('DRAFT', 'SENDING', 'SENT');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EmailCampaignSendStatus') THEN
    CREATE TYPE "EmailCampaignSendStatus" AS ENUM ('SENT', 'FAILED');
  END IF;
END $$;

-- newsletter_subscribers
DO $$
BEGIN
  IF to_regclass('public.newsletter_subscribers') IS NULL THEN
    CREATE TABLE "newsletter_subscribers" (
      "id" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "firstName" TEXT,
      "lastName" TEXT,
      "status" "NewsletterSubscriberStatus" NOT NULL DEFAULT 'SUBSCRIBED',
      "source" TEXT,
      "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "unsubscribedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
    );

    CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");
    CREATE INDEX "newsletter_subscribers_status_idx" ON "newsletter_subscribers"("status");
    CREATE INDEX "newsletter_subscribers_subscribedAt_idx" ON "newsletter_subscribers"("subscribedAt");
  END IF;
END $$;

-- email_campaigns
DO $$
BEGIN
  IF to_regclass('public.email_campaigns') IS NULL THEN
    CREATE TABLE "email_campaigns" (
      "id" TEXT NOT NULL,
      "name" TEXT,
      "subject" TEXT NOT NULL,
      "preheader" TEXT,
      "html" TEXT NOT NULL,
      "text" TEXT,
      "status" "EmailCampaignStatus" NOT NULL DEFAULT 'DRAFT',
      "sentAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "email_campaigns_pkey" PRIMARY KEY ("id")
    );

    CREATE INDEX "email_campaigns_status_idx" ON "email_campaigns"("status");
    CREATE INDEX "email_campaigns_createdAt_idx" ON "email_campaigns"("createdAt");
  END IF;
END $$;

-- email_campaign_sends
DO $$
BEGIN
  IF to_regclass('public.email_campaign_sends') IS NULL THEN
    CREATE TABLE "email_campaign_sends" (
      "id" TEXT NOT NULL,
      "campaignId" TEXT NOT NULL,
      "subscriberId" TEXT,
      "email" TEXT NOT NULL,
      "status" "EmailCampaignSendStatus" NOT NULL,
      "error" TEXT,
      "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "email_campaign_sends_pkey" PRIMARY KEY ("id")
    );

    CREATE INDEX "email_campaign_sends_campaignId_idx" ON "email_campaign_sends"("campaignId");
    CREATE INDEX "email_campaign_sends_email_idx" ON "email_campaign_sends"("email");
    CREATE INDEX "email_campaign_sends_sentAt_idx" ON "email_campaign_sends"("sentAt");

    ALTER TABLE "email_campaign_sends"
      ADD CONSTRAINT "email_campaign_sends_campaignId_fkey"
      FOREIGN KEY ("campaignId") REFERENCES "email_campaigns"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;

    ALTER TABLE "email_campaign_sends"
      ADD CONSTRAINT "email_campaign_sends_subscriberId_fkey"
      FOREIGN KEY ("subscriberId") REFERENCES "newsletter_subscribers"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

