/*
  Warnings:

  - A unique constraint covering the columns `[attributeId,valueText]` on the table `attribute_values` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `attributes` will be added. If there are existing duplicate values, this will fail.
  - Made the column `attributeId` on table `attribute_values` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "attribute_values" DROP CONSTRAINT "attribute_values_attributeId_fkey";

-- AlterTable
ALTER TABLE "attribute_values" ALTER COLUMN "attributeId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "attribute_values_attributeId_valueText_key" ON "attribute_values"("attributeId", "valueText");

-- CreateIndex
CREATE UNIQUE INDEX "attributes_name_key" ON "attributes"("name");

-- AddForeignKey
ALTER TABLE "attribute_values" ADD CONSTRAINT "attribute_values_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "attributes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
