-- CreateTable
CREATE TABLE "ProductFaq" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "userId" INTEGER,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "answeredBy" INTEGER,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "answeredAt" TIMESTAMPTZ,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "ProductFaq_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductFaq_productId_idx" ON "ProductFaq"("productId");

-- AddForeignKey
ALTER TABLE "ProductFaq" ADD CONSTRAINT "ProductFaq_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductFaq" ADD CONSTRAINT "ProductFaq_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductFaq" ADD CONSTRAINT "ProductFaq_answeredBy_fkey" FOREIGN KEY ("answeredBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
