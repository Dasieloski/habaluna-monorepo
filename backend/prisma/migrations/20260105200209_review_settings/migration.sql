-- CreateTable
CREATE TABLE "review_settings" (
    "id" TEXT NOT NULL,
    "autoApproveReviews" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_settings_pkey" PRIMARY KEY ("id")
);
