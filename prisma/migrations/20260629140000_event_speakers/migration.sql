-- CreateTable
CREATE TABLE "EventSpeaker" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "bio" TEXT,
    "photoUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventSpeaker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventSpeaker_eventId_sortOrder_idx" ON "EventSpeaker"("eventId", "sortOrder");

-- AddForeignKey
ALTER TABLE "EventSpeaker" ADD CONSTRAINT "EventSpeaker_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
