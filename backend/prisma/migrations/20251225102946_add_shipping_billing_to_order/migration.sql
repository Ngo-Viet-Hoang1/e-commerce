-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingAddressDetail" VARCHAR(500),
ADD COLUMN     "shippingPhone" VARCHAR(20),
ADD COLUMN     "shippingProvinceId" INTEGER,
ADD COLUMN     "shippingRecipientName" VARCHAR(255);
