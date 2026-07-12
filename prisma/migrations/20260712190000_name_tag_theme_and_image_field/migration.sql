-- AlterEnum
ALTER TYPE "FormFieldType" ADD VALUE 'IMAGE';

-- AlterTable
ALTER TABLE "Event"
  ADD COLUMN "tagPrimaryColor" TEXT NOT NULL DEFAULT '#4a3428',
  ADD COLUMN "tagSecondaryColor" TEXT NOT NULL DEFAULT '#f5f0e8',
  ADD COLUMN "tagFooterText" TEXT;
