-- CreateTable
CREATE TABLE "Order" (
    "orderId" SERIAL NOT NULL,
    "userId" INTEGER,
    "status" VARCHAR(50) NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(10) DEFAULT 'USD',
    "shippingAddress" JSONB,
    "billingAddress" JSONB,
    "shippingMethod" VARCHAR(255),
    "shippingFee" DECIMAL(12,2),
    "paymentStatus" VARCHAR(50) DEFAULT 'pending',
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "placedAt" TIMESTAMPTZ,
    "deliveredAt" TIMESTAMPTZ,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("orderId")
);

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_paymentStatus_idx" ON "Order"("paymentStatus");

-- CreateIndex
CREATE INDEX "Order_deletedAt_idx" ON "Order"("deletedAt");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
