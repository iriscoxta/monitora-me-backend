-- CreateTable
CREATE TABLE "Bidding" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "supplierId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bidding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bidding_number_key" ON "Bidding"("number");

-- AddForeignKey
ALTER TABLE "Bidding" ADD CONSTRAINT "Bidding_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
