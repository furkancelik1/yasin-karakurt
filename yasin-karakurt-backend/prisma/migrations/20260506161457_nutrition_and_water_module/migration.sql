/*
  Warnings:

  - You are about to drop the column `completedAt` on the `meals` table. All the data in the column will be lost.
  - You are about to drop the column `isCompleted` on the `meals` table. All the data in the column will be lost.
  - Made the column `content` on table `meals` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "meals" DROP COLUMN "completedAt",
DROP COLUMN "isCompleted",
ADD COLUMN     "isDone" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "content" SET NOT NULL;

-- AlterTable
ALTER TABLE "nutrition_plans" ADD COLUMN     "title" TEXT;
