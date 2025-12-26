-- DropForeignKey
ALTER TABLE "product_images" DROP CONSTRAINT "product_images_variantId_fkey";

-- AlterTable
ALTER TABLE "product_images" ALTER COLUMN "variantId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
