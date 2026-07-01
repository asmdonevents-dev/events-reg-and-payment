import { z } from "zod";

export const EventAssignmentGroupSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Group name is required"),
  capacity: z.number().int().min(0, "Capacity must be 0 or greater"),
  sortOrder: z.number().int().min(0),
});

export const EventAssignmentGroupsSchema = z.array(EventAssignmentGroupSchema);

export type EventAssignmentGroupFormValues = z.infer<
  typeof EventAssignmentGroupSchema
>;
