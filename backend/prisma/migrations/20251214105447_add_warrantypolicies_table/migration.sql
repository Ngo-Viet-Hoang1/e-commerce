-- CreateTable
CREATE TABLE "WarrantyPolicy" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "brandId" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "durationDays" INTEGER NOT NULL,
    "termsUrl" VARCHAR(1024),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "WarrantyPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WarrantyPolicy_productId_idx" ON "WarrantyPolicy"("productId");

-- CreateIndex
CREATE INDEX "WarrantyPolicy_brandId_idx" ON "WarrantyPolicy"("brandId");

-- CreateIndex
CREATE INDEX "WarrantyPolicy_durationDays_idx" ON "WarrantyPolicy"("durationDays");

-- AddForeignKey
ALTER TABLE "WarrantyPolicy" ADD CONSTRAINT "WarrantyPolicy_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarrantyPolicy" ADD CONSTRAINT "WarrantyPolicy_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
