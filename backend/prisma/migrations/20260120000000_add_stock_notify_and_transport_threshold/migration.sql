-- AlterTable
ALTER TABLE "transport_config" ADD COLUMN IF NOT EXISTS "freeShippingThresholdUSD" DECIMAL(10,2);

-- CreateTable
CREATE TABLE IF NOT EXISTS "stock_notify" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "notifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_notify_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "stock_notify_productId_email_key" ON "stock_notify"("productId", "email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "stock_notify_productId_idx" ON "stock_notify"("productId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "stock_notify_email_idx" ON "stock_notify"("email");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'stock_notify_productId_fkey'
    ) THEN
        ALTER TABLE "stock_notify" ADD CONSTRAINT "stock_notify_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;
