/*
  Warnings:

  - Added the required column `updatedAt` to the `credits` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "credits" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "used" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "amount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "usage_records" ADD COLUMN     "creditId" TEXT,
ADD COLUMN     "isTrial" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "creditsUsed" SET DEFAULT 1;

-- CreateTable
CREATE TABLE "subscription_credits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalCredits" INTEGER NOT NULL,
    "usedCredits" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_credits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "subscription_credits_userId_subscriptionId_idx" ON "subscription_credits"("userId", "subscriptionId");

-- CreateIndex
CREATE INDEX "subscription_credits_periodEnd_idx" ON "subscription_credits"("periodEnd");

-- CreateIndex
CREATE INDEX "credits_userId_idx" ON "credits"("userId");

-- CreateIndex
CREATE INDEX "credits_expiresAt_idx" ON "credits"("expiresAt");

-- CreateIndex
CREATE INDEX "credits_subscriptionId_idx" ON "credits"("subscriptionId");

-- AddForeignKey
ALTER TABLE "credits" ADD CONSTRAINT "credits_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "user_subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_credits" ADD CONSTRAINT "subscription_credits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_credits" ADD CONSTRAINT "subscription_credits_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "user_subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_creditId_fkey" FOREIGN KEY ("creditId") REFERENCES "credits"("id") ON DELETE SET NULL ON UPDATE CASCADE;
