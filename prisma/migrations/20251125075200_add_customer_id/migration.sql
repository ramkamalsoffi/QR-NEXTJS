/*
  Warnings:

  - Added the required column `customerId` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: Add column as nullable first
ALTER TABLE "Customer" ADD COLUMN "customerId" TEXT;

-- Update existing rows with customerId based on email
UPDATE "Customer" SET "customerId" = MD5(LOWER(TRIM(email))) WHERE "customerId" IS NULL;

-- Make customerId NOT NULL
ALTER TABLE "Customer" ALTER COLUMN "customerId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Customer_customerId_idx" ON "Customer"("customerId");

-- CreateIndex
CREATE INDEX "Customer_email_idx" ON "Customer"("email");
