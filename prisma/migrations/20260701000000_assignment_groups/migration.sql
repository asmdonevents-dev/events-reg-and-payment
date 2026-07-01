-- CreateTable
CREATE TABLE "EventAssignmentGroup" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventAssignmentGroup_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "EventRegistration" ADD COLUMN "assignmentGroupId" TEXT;

-- CreateIndex
CREATE INDEX "EventAssignmentGroup_eventId_sortOrder_idx" ON "EventAssignmentGroup"("eventId", "sortOrder");

-- CreateIndex
CREATE INDEX "EventRegistration_assignmentGroupId_idx" ON "EventRegistration"("assignmentGroupId");

-- AddForeignKey
ALTER TABLE "EventAssignmentGroup" ADD CONSTRAINT "EventAssignmentGroup_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_assignmentGroupId_fkey" FOREIGN KEY ("assignmentGroupId") REFERENCES "EventAssignmentGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
