-- CreateTable
CREATE TABLE "ProductVideo" (
    "videoId" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "variantId" INTEGER NOT NULL,
    "title" VARCHAR(255),
    "provider" VARCHAR(100),
    "url" VARCHAR(1024) NOT NULL,
    "thumbnailUrl" VARCHAR(1024),
    "durationSeconds" INTEGER,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "ProductVideo_pkey" PRIMARY KEY ("videoId")
);

-- AddForeignKey
ALTER TABLE "ProductVideo" ADD CONSTRAINT "ProductVideo_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVideo" ADD CONSTRAINT "ProductVideo_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
