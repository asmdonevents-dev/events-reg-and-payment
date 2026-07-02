-- AlterTable
ALTER TABLE "Admin" ADD COLUMN "pendingEmail" TEXT,
ADD COLUMN "emailVerificationCodeHash" TEXT,
ADD COLUMN "emailVerificationExpiresAt" TIMESTAMP(3);
