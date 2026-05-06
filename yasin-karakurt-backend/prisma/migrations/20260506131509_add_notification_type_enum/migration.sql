-- CreateEnum
CREATE TYPE "ProgramType" AS ENUM ('TRAINING', 'NUTRITION');

-- CreateEnum
CREATE TYPE "ProgramContentType" AS ENUM ('TEXT', 'FILE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PROGRAM_ASSIGNED', 'CHECKIN_REMINDER', 'SYSTEM');

-- CreateTable
CREATE TABLE "user_programs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ProgramType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "contentType" "ProgramContentType" NOT NULL DEFAULT 'TEXT',
    "fileUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_programs" ADD CONSTRAINT "user_programs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
