/*
  Warnings:

  - You are about to drop the `Bidding` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Bidding" DROP CONSTRAINT "Bidding_supplierId_fkey";

-- DropTable
DROP TABLE "Bidding";
