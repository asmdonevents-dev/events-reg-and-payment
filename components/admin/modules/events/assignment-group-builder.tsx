"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import NumberInput from "@/components/custom/number-input";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { EventFormValues } from "@/validators/schemas/event";

export default function AssignmentGroupBuilder() {
  const form = useFormContext<EventFormValues>();
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "assignmentGroups",
  });

  return (
    <div className="flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-base text-primary">Assignment groups</h3>
          <p className="text-sm text-muted-foreground">
            Optional. Attendees are randomly assigned to a group with available
            capacity when registration is confirmed. Set capacity to 0 for
            unlimited.
          </p>
        </div>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          No assignment groups configured. Attendees will not receive a group
          assignment.
        </div>
      ) : (
        fields.map((field, index) => (
          <div key={field.id} className="flex flex-col gap-3 rounded-lg border p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Group {index + 1}</p>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={index === fields.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  <ArrowDown className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <FormField
                control={form.control}
                name={`assignmentGroups.${index}.name`}
                render={({ field: nameField }) => (
                  <FormItem>
                    <FormLabel>Group name</FormLabel>
                    <FormControl>
                      <Input {...nameField} placeholder="Bible Study Class A" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`assignmentGroups.${index}.capacity`}
                render={({ field: capacityField }) => (
                  <FormItem>
                    <FormLabel>Capacity (0 = unlimited)</FormLabel>
                    <FormControl>
                      <NumberInput
                        value={capacityField.value}
                        onChange={capacityField.onChange}
                        min={0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))
      )}

      <Button
        type="button"
        size="sm"
        variant="outline"
        className="self-start"
        onClick={() =>
          append({
            name: "",
            capacity: 0,
            sortOrder: fields.length,
          })
        }
      >
        <Plus className="size-4" data-icon="inline-start" />
        Add group
      </Button>
    </div>
  );
}
