import type { EventSpeaker } from "@prisma/client";

export interface EventSpeakerFormValues {
  id?: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  sortOrder: number;
}

export interface EventSpeakerUI {
  id: string;
  eventId: string;
  name: string;
  role: string | null;
  bio: string | null;
  photoUrl: string | null;
  sortOrder: number;
}

export function toEventSpeakerUI(speaker: EventSpeaker): EventSpeakerUI {
  return {
    id: speaker.id,
    eventId: speaker.eventId,
    name: speaker.name,
    role: speaker.role,
    bio: speaker.bio,
    photoUrl: speaker.photoUrl,
    sortOrder: speaker.sortOrder,
  };
}
