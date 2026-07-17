"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  defaultTagFieldKeys,
  isTagEligibleField,
  sanitizeTagFieldKeys,
} from "@/lib/tag-fields";
import type { EventFormValues } from "@/validators/schemas/event";

export default function TagFieldSelector() {
  const form = useFormContext<EventFormValues>();
  const formFields = form.watch("formFields");
  const tagFieldKeys = form.watch("tagFieldKeys");
  const eligibleFields = formFields.filter(isTagEligibleField);

  useEffect(() => {
    const sanitized = sanitizeTagFieldKeys(tagFieldKeys, formFields);
    if (sanitized.join("|") !== tagFieldKeys.join("|")) {
      form.setValue("tagFieldKeys", sanitized, { shouldDirty: true });
    }
  }, [form, formFields, tagFieldKeys]);

  function toggleField(fieldKey: string, checked: boolean) {
    const orderedKeys = eligibleFields.map((field) => field.fieldKey);
    const selected = new Set(tagFieldKeys);

    if (checked) {
      selected.add(fieldKey);
    } else {
      selected.delete(fieldKey);
    }

    form.setValue(
      "tagFieldKeys",
      orderedKeys.filter((key) => selected.has(key)),
      { shouldDirty: true }
    );
  }

  if (eligibleFields.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
        Add registration fields above to choose what appears on the name tag.
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-4">
      <div className="mb-4">
        <h3 className="text-base text-primary">Tag fields</h3>
        <p className="text-sm text-muted-foreground">
          Choose which registration answers appear on the printable name tag.
          The participant name always appears at the top. Uploaded photos
          appear in the photo area when provided.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {eligibleFields.map((field) => {
          const checked = tagFieldKeys.includes(field.fieldKey);

          return (
            <div
              key={field.fieldKey}
              className="flex items-start gap-3 rounded-lg border bg-muted/20 px-3 py-2"
            >
              <Checkbox
                id={`tag-field-${field.fieldKey}`}
                checked={checked}
                onCheckedChange={(value) =>
                  toggleField(field.fieldKey, value === true)
                }
              />
              <div className="min-w-0 flex-1">
                <Label
                  htmlFor={`tag-field-${field.fieldKey}`}
                  className="cursor-pointer font-medium"
                >
                  {field.label}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {field.fieldKey}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {tagFieldKeys.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No extra fields selected. Only the participant name will show on the
          tag.
        </p>
      ) : null}
    </div>
  );
}

export function getInitialTagFieldKeys(
  eventTagFieldKeys: string[] | null | undefined,
  formFields: EventFormValues["formFields"]
) {
  if (eventTagFieldKeys == null) {
    return defaultTagFieldKeys(formFields);
  }

  return sanitizeTagFieldKeys(eventTagFieldKeys, formFields);
}
