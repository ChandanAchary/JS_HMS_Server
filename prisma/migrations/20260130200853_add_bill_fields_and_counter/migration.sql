/*
  Warnings:

  - You are about to drop the column `amount` on the `bills` table. All the data in the column will be lost.
  - You are about to drop the column `employeeId` on the `bills` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[billId]` on the table `bills` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `billId` to the `bills` table without a default value. This is not possible if the table is not empty.
  - Added the required column `services` to the `bills` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `bills` table without a default value. This is not possible if the table is not empty.
  - Made the column `patientId` on table `bills` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "bills" DROP CONSTRAINT "bills_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "bills" DROP CONSTRAINT "bills_patientId_fkey";

-- AlterTable
ALTER TABLE "bills" DROP COLUMN "amount",
DROP COLUMN "employeeId",
ADD COLUMN     "billDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "billId" TEXT NOT NULL,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "lockedAt" TIMESTAMP(3),
ADD COLUMN     "paymentDetails" JSONB,
ADD COLUMN     "paymentMode" TEXT,
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
ADD COLUMN     "services" JSONB NOT NULL,
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "patientId" SET NOT NULL;

-- CreateTable
CREATE TABLE "counters" (
    "id" TEXT NOT NULL,
    "seq" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "counters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bills_billId_key" ON "bills"("billId");

-- CreateIndex
CREATE INDEX "bills_hospitalId_idx" ON "bills"("hospitalId");

-- CreateIndex
CREATE INDEX "bills_patientId_idx" ON "bills"("patientId");

-- CreateIndex
CREATE INDEX "bills_billId_idx" ON "bills"("billId");

-- CreateIndex
CREATE INDEX "bills_billDate_idx" ON "bills"("billDate");

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("patientId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
