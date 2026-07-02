import type { EventFormField, FormFieldType } from "@prisma/client";

export interface FormFieldFormValues {
  id?: string;
  label: string;
  fieldKey: string;
  fieldType: FormFieldType;
  placeholder: string;
  helpText: string;
  required: boolean;
  options: string[];
  dependsOn?: string | null;
  conditionalOptions?: Record<string, string[]> | null;
  sortOrder: number;
}

export interface FormFieldUI {
  id: string;
  eventId: string;
  label: string;
  fieldKey: string;
  fieldType: FormFieldType;
  placeholder: string | null;
  helpText: string | null;
  required: boolean;
  options: string[];
  dependsOn: string | null;
  conditionalOptions: Record<string, string[]> | null;
  sortOrder: number;
}

function parseConditionalOptions(
  value: EventFormField["conditionalOptions"]
): Record<string, string[]> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const parsed: Record<string, string[]> = {};

  for (const [key, options] of Object.entries(value as Record<string, unknown>)) {
    if (Array.isArray(options)) {
      parsed[key] = options.filter((option): option is string => typeof option === "string");
    }
  }

  return Object.keys(parsed).length > 0 ? parsed : null;
}

export function toFormFieldUI(field: EventFormField): FormFieldUI {
  const options = Array.isArray(field.options)
    ? (field.options as string[])
    : [];

  return {
    id: field.id,
    eventId: field.eventId,
    label: field.label,
    fieldKey: field.fieldKey,
    fieldType: field.fieldType,
    placeholder: field.placeholder,
    helpText: field.helpText,
    required: field.required,
    options,
    dependsOn: field.dependsOn,
    conditionalOptions: parseConditionalOptions(field.conditionalOptions),
    sortOrder: field.sortOrder,
  };
}
