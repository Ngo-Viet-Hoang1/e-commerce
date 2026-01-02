-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingDistrictId" INTEGER;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shippingProvinceId_fkey" FOREIGN KEY ("shippingProvinceId") REFERENCES "Province"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shippingDistrictId_fkey" FOREIGN KEY ("shippingDistrictId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;
