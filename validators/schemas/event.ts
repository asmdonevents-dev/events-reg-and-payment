import { z } from "zod";
import { FormFieldsSchema } from "@/validators/schemas/form-field";
import { EventSpeakersSchema } from "@/validators/schemas/speaker";
import { EventAssignmentGroupsSchema } from "@/validators/schemas/assignment-group";
import type { FormFieldFormValues } from "@/validators/types/form-field";
import type { EventSpeakerFormValues } from "@/validators/types/speaker";
import type { EventAssignmentGroupFormValues } from "@/validators/schemas/assignment-group";

export const EventStatusEnum = z.enum(["DRAFT", "PUBLISHED", "CANCELLED"]);

export type EventFormValues = {
  title: string;
  slug: string;
  description: string;
  bannerImage: string;
  startDate: string;
  endDate: string;
  venue: string;
  capacity: number;
  isFree: boolean;
  ticketPrice: number;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  formFields: FormFieldFormValues[];
  speakers: EventSpeakerFormValues[];
  assignmentGroups: EventAssignmentGroupFormValues[];
};

export const EventSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().min(1, "Description is required"),
    bannerImage: z.string(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    venue: z.string().min(1, "Venue is required"),
    capacity: z.number().int().min(1, "Capacity must be at least 1"),
    isFree: z.boolean(),
    ticketPrice: z.number().min(0),
    status: EventStatusEnum,
    formFields: FormFieldsSchema,
    speakers: EventSpeakersSchema,
    assignmentGroups: EventAssignmentGroupsSchema,
  })
  .refine(
    (data) => new Date(data.endDate) >= new Date(data.startDate),
    { message: "End date must be after start date", path: ["endDate"] }
  )
  .refine(
    (data) => data.isFree || data.ticketPrice > 0,
    { message: "Ticket price is required for paid events", path: ["ticketPrice"] }
  );

export function toInt(value: unknown, fallback = 0): number {
  if (typeof value === "number") return Math.trunc(value);
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isNaN(n) ? fallback : Math.trunc(n);
  }
  return fallback;
}

export function toFloat(value: unknown, fallback = 0): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isNaN(n) ? fallback : n;
  }
  return fallback;
}
