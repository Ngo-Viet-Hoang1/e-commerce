/*
  Warnings:

  - You are about to drop the column `provinceId` on the `Ward` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Province` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `provinceCode` to the `Ward` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Ward" DROP CONSTRAINT "Ward_provinceId_fkey";

-- DropIndex
DROP INDEX "Ward_provinceId_idx";

-- AlterTable
ALTER TABLE "Province" ADD COLUMN     "administrativeUnitFullName" VARCHAR(100),
ADD COLUMN     "administrativeUnitFullNameEn" VARCHAR(100),
ADD COLUMN     "administrativeUnitId" INTEGER,
ADD COLUMN     "administrativeUnitShortName" VARCHAR(50),
ADD COLUMN     "codeName" VARCHAR(100),
ADD COLUMN     "fullName" VARCHAR(200),
ADD COLUMN     "fullNameEn" VARCHAR(200);

-- AlterTable
ALTER TABLE "Ward" DROP COLUMN "provinceId",
ADD COLUMN     "administrativeUnitFullName" VARCHAR(100),
ADD COLUMN     "administrativeUnitFullNameEn" VARCHAR(100),
ADD COLUMN     "administrativeUnitId" INTEGER,
ADD COLUMN     "administrativeUnitShortName" VARCHAR(50),
ADD COLUMN     "administrativeUnitShortNameEn" VARCHAR(50),
ADD COLUMN     "codeName" VARCHAR(150),
ADD COLUMN     "fullName" VARCHAR(200),
ADD COLUMN     "fullNameEn" VARCHAR(200),
ADD COLUMN     "provinceCode" VARCHAR(10) NOT NULL,
ALTER COLUMN "code" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(150),
ALTER COLUMN "nameEn" SET DATA TYPE VARCHAR(150);

-- CreateIndex
CREATE UNIQUE INDEX "Province_name_key" ON "Province"("name");

-- CreateIndex
CREATE INDEX "Province_codeName_idx" ON "Province"("codeName");

-- CreateIndex
CREATE INDEX "Ward_provinceCode_idx" ON "Ward"("provinceCode");

-- CreateIndex
CREATE INDEX "Ward_codeName_idx" ON "Ward"("codeName");

-- AddForeignKey
ALTER TABLE "Ward" ADD CONSTRAINT "Ward_provinceCode_fkey" FOREIGN KEY ("provinceCode") REFERENCES "Province"("code") ON DELETE CASCADE ON UPDATE CASCADE;
