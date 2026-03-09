-- AlterEnum
BEGIN;
CREATE TYPE "Currency_new" AS ENUM ('USD');
ALTER TABLE "orders" ALTER COLUMN "currency" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "currency" TYPE "Currency_new" USING ("currency"::text::"Currency_new");
ALTER TABLE "payments" ALTER COLUMN "currency" TYPE "Currency_new" USING ("currency"::text::"Currency_new");
ALTER TYPE "Currency" RENAME TO "Currency_old";
ALTER TYPE "Currency_new" RENAME TO "Currency";
DROP TYPE "Currency_old";
ALTER TABLE "orders" ALTER COLUMN "currency" SET DEFAULT 'USD';
COMMIT;

-- AlterTable
ALTER TABLE "product_variants" DROP COLUMN "comparePriceMNs",
DROP COLUMN "priceMNs";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "comparePriceMNs",
DROP COLUMN "priceMNs";
