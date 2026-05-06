/*
  Warnings:

  - You are about to drop the column `description` on the `meals` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "meals" DROP COLUMN "description",
ADD COLUMN     "content" TEXT,
ADD COLUMN     "time" TEXT;

-- CreateTable
CREATE TABLE "water_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "water_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "water_logs_userId_date_idx" ON "water_logs"("userId", "date");

-- AddForeignKey
ALTER TABLE "water_logs" ADD CONSTRAINT "water_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
