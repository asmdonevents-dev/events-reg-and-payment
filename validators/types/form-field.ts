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
  sortOrder: number;
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
    sortOrder: field.sortOrder,
  };
}
