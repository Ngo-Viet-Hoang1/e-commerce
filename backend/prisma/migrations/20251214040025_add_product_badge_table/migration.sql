-- CreateTable
CREATE TABLE "product_badges" (
    "productId" INTEGER NOT NULL,
    "badgeId" INTEGER NOT NULL,
    "awardedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "awardedBy" INTEGER,
    "deleteAt" TIMESTAMPTZ,

    CONSTRAINT "product_badges_pkey" PRIMARY KEY ("productId","badgeId")
);

-- AddForeignKey
ALTER TABLE "product_badges" ADD CONSTRAINT "product_badges_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_badges" ADD CONSTRAINT "product_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_badges" ADD CONSTRAINT "product_badges_awardedBy_fkey" FOREIGN KEY ("awardedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
