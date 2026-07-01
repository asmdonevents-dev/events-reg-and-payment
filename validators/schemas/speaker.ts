import { z } from "zod";

export const EventSpeakerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Speaker name is required"),
  role: z.string(),
  bio: z.string(),
  photoUrl: z.string(),
  sortOrder: z.number().int().min(0),
});

export const EventSpeakersSchema = z.array(EventSpeakerSchema);

export type EventSpeakerFormValues = z.infer<typeof EventSpeakerSchema>;
