-- DropForeignKey
ALTER TABLE "check_ins" DROP CONSTRAINT "check_ins_userId_fkey";

-- AlterTable
ALTER TABLE "check_ins" ADD COLUMN     "backPhotoUrl" TEXT,
ADD COLUMN     "coachNotes" TEXT,
ADD COLUMN     "energyLevel" INTEGER,
ADD COLUMN     "frontPhotoUrl" TEXT,
ADD COLUMN     "hungerLevel" INTEGER,
ADD COLUMN     "rating" INTEGER,
ADD COLUMN     "sidePhotoUrl" TEXT,
ADD COLUMN     "sleepHours" INTEGER,
ADD COLUMN     "stressLevel" INTEGER;

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
