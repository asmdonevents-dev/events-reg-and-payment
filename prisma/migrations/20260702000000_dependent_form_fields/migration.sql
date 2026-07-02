-- AlterTable
ALTER TABLE "EventFormField"
  ADD COLUMN "dependsOn" TEXT,
  ADD COLUMN "conditionalOptions" JSONB;
