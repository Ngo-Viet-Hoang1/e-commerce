/*
  Warnings:

  - You are about to drop the column `shippingAddressDetail` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingPhone` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingProvinceId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingRecipientName` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "shippingAddressDetail",
DROP COLUMN "shippingPhone",
DROP COLUMN "shippingProvinceId",
DROP COLUMN "shippingRecipientName";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phoneNumber" VARCHAR(14);

-- CreateTable
CREATE TABLE "Address" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "districtCode" VARCHAR(20) NOT NULL,
    "provinceCode" VARCHAR(10) NOT NULL,
    "detail" VARCHAR(500),
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "Address"("userId");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_districtCode_fkey" FOREIGN KEY ("districtCode") REFERENCES "District"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_provinceCode_fkey" FOREIGN KEY ("provinceCode") REFERENCES "Province"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
