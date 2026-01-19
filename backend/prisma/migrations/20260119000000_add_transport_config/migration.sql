-- CreateTable
CREATE TABLE "transport_config" (
    "id" TEXT NOT NULL,
    "baseCost" DECIMAL(10,2) NOT NULL,
    "discountsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "rules" JSONB,
    "noDiscountMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transport_config_pkey" PRIMARY KEY ("id")
);
