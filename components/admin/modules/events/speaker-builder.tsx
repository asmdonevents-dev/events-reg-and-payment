"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import ImageUploader from "@/components/custom/imageuploader";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { EventFormValues } from "@/validators/schemas/event";

export default function SpeakerBuilder() {
  const form = useFormContext<EventFormValues>();
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "speakers",
  });

  return (
    <div className="flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-base text-primary">Event speakers</h3>
          <p className="text-sm text-muted-foreground">
            Optional. Add speakers to display on the public event detail page.
          </p>
        </div>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          No speakers added. This event will not show a speakers section.
        </div>
      ) : (
        fields.map((field, index) => (
          <div key={field.id} className="flex flex-col gap-3 rounded-lg border p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base text-primary">Speaker {index + 1}</h3>
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
                name={`speakers.${index}.name`}
                render={({ field: nameField }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...nameField} placeholder="Speaker name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`speakers.${index}.role`}
                render={({ field: roleField }) => (
                  <FormItem>
                    <FormLabel>Role / title</FormLabel>
                    <FormControl>
                      <Input {...roleField} placeholder="Keynote speaker" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name={`speakers.${index}.bio`}
              render={({ field: bioField }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...bioField} placeholder="Short speaker bio" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`speakers.${index}.photoUrl`}
              render={({ field: photoField }) => (
                <FormItem>
                  <FormControl>
                    <ImageUploader
                      value={photoField.value}
                      onChange={photoField.onChange}
                      label="Speaker photo"
                      folder="asm-events/speakers"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            role: "",
            bio: "",
            photoUrl: "",
            sortOrder: fields.length,
          })
        }
      >
        <Plus className="size-4" data-icon="inline-start" />
        Add speaker
      </Button>
    </div>
  );
}
