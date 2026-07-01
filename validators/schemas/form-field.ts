import { z } from "zod";
import { fieldHasOptions, normalizeFieldOptions, slugifyFieldKey } from "@/lib/form-fields";

export const FormFieldTypeEnum = z.enum([
  "TEXT",
  "TEXTAREA",
  "EMAIL",
  "PHONE",
  "NUMBER",
  "SELECT",
  "RADIO",
  "CHECKBOX",
  "DATE",
]);

export const FormFieldSchema = z
  .object({
    id: z.string().optional(),
    label: z.string().min(1, "Field label is required"),
    fieldKey: z.string().min(1, "Field key is required"),
    fieldType: FormFieldTypeEnum,
    placeholder: z.string(),
    helpText: z.string(),
    required: z.boolean(),
    options: z.array(z.string()),
    sortOrder: z.number().int().min(0),
  })
  .superRefine((field, ctx) => {
    if (fieldHasOptions(field.fieldType)) {
      const options = normalizeFieldOptions(field.options);
      if (options.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "Add at least one option for this field type",
          path: ["options"],
        });
      }
    }
  });

export const FormFieldsSchema = z
  .array(FormFieldSchema)
  .min(1, "Add at least one registration field")
  .superRefine((fields, ctx) => {
    const keys = new Set<string>();

    for (const [index, field] of fields.entries()) {
      const key = field.fieldKey || slugifyFieldKey(field.label);
      if (keys.has(key)) {
        ctx.addIssue({
          code: "custom",
          message: "Field keys must be unique",
          path: [index, "fieldKey"],
        });
      }
      keys.add(key);
    }

    const hasEmailField = fields.some((field) => field.fieldType === "EMAIL");
    if (!hasEmailField) {
      ctx.addIssue({
        code: "custom",
        message: "Include at least one Email field for confirmations and payments",
        path: [],
      });
    }
  });

export type FormFieldFormValues = z.infer<typeof FormFieldSchema>;
