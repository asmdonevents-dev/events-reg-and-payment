"use client";

import { useRef, useState } from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/custom/datetimepicker";
import ImageUploader from "@/components/custom/imageuploader";
import NumberInput from "@/components/custom/number-input";
import { ButtonSpinner } from "@/components/custom/spinner";
import FormFieldBuilder from "@/components/admin/modules/events/form-field-builder";
import AssignmentGroupBuilder from "@/components/admin/modules/events/assignment-group-builder";
import SpeakerBuilder from "@/components/admin/modules/events/speaker-builder";
import { useCreateEvent, useUpdateEvent } from "@/hooks/use-events";
import { DEFAULT_EVENT_FORM_FIELDS } from "@/lib/form-fields";
import {
  fromDateTimeLocalValue,
  toDateTimeLocalValue,
} from "@/lib/datetime-local";
import { slugify } from "@/lib/utils";
import {
  EventSchema,
  toFloat,
  toInt,
  type EventFormValues,
} from "@/validators/schemas/event";
import type { EventUI } from "@/validators/types/event";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

type FormStepId =
  | "details"
  | "schedule"
  | "registration"
  | "speakers"
  | "assignments";

const FORM_STEPS: ReadonlyArray<{
  id: FormStepId;
  label: string;
  fields: readonly FieldPath<EventFormValues>[];
}> = [
  {
    id: "details",
    label: "Details",
    fields: ["title", "slug", "description", "bannerImage", "status"],
  },
  {
    id: "schedule",
    label: "Schedule",
    fields: ["startDate", "endDate", "venue", "capacity"],
  },
  {
    id: "registration",
    label: "Registration",
    fields: ["isFree", "ticketPrice", "formFields"],
  },
  {
    id: "speakers",
    label: "Speakers",
    fields: ["speakers"],
  },
  {
    id: "assignments",
    label: "Assignments",
    fields: ["assignmentGroups"],
  },
];

interface ManageEventFormProps {
  event?: EventUI;
  onSuccess: () => void;
}

export default function ManageEventForm({
  event,
  onSuccess,
}: ManageEventFormProps) {
  const { mutateAsync: createEvent, isLoading: isCreating } = useCreateEvent();
  const { mutateAsync: updateEvent, isLoading: isUpdating } = useUpdateEvent();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(EventSchema),
    defaultValues: {
      title: event?.title ?? "",
      slug: event?.slug ?? "",
      description: event?.description ?? "",
      bannerImage: event?.bannerImage ?? "",
      startDate: event?.startDate
        ? new Date(event.startDate).toISOString().slice(0, 16)
        : "",
      endDate: event?.endDate
        ? new Date(event.endDate).toISOString().slice(0, 16)
        : "",
      venue: event?.venue ?? "",
      capacity: event?.capacity ?? 100,
      isFree: event?.isFree ?? false,
      ticketPrice: event?.ticketPrice ?? 0,
      status: event?.status ?? "DRAFT",
      formFields:
        event?.formFields.map((field) => ({
          id: field.id,
          label: field.label,
          fieldKey: field.fieldKey,
          fieldType: field.fieldType,
          placeholder: field.placeholder ?? "",
          helpText: field.helpText ?? "",
          required: field.required,
          options: field.options,
          sortOrder: field.sortOrder,
        })) ?? DEFAULT_EVENT_FORM_FIELDS,
      speakers:
        event?.speakers.map((speaker) => ({
          id: speaker.id,
          name: speaker.name,
          role: speaker.role ?? "",
          bio: speaker.bio ?? "",
          photoUrl: speaker.photoUrl ?? "",
          sortOrder: speaker.sortOrder,
        })) ?? [],
      assignmentGroups:
        event?.assignmentGroups.map((group) => ({
          id: group.id,
          name: group.name,
          capacity: group.capacity,
          sortOrder: group.sortOrder,
        })) ?? [],
    },
  });

  const slugManuallyEdited = useRef(Boolean(event));
  const [activeTab, setActiveTab] = useState<FormStepId>("details");
  const isFree = form.watch("isFree");
  const isLoading = isCreating || isUpdating;
  const currentStepIndex = FORM_STEPS.findIndex(
    (step) => step.id === activeTab,
  );
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === FORM_STEPS.length - 1;

  async function validateCurrentStep() {
    const step = FORM_STEPS[currentStepIndex];
    const valid = await form.trigger(step.fields);

    if (!valid) {
      toast.error("Please fix the errors before continuing");
      return false;
    }

    if (step.id === "schedule") {
      const startDate = form.getValues("startDate");
      const endDate = form.getValues("endDate");
      if (new Date(endDate) < new Date(startDate)) {
        form.setError("endDate", {
          type: "manual",
          message: "End date must be after start date",
        });
        toast.error("Please fix the errors before continuing");
        return false;
      }
    }

    if (step.id === "registration" && !form.getValues("isFree")) {
      const ticketPrice = form.getValues("ticketPrice");
      if (ticketPrice <= 0) {
        form.setError("ticketPrice", {
          type: "manual",
          message: "Ticket price is required for paid events",
        });
        toast.error("Please fix the errors before continuing");
        return false;
      }
    }

    return true;
  }

  async function handleNext() {
    const valid = await validateCurrentStep();
    if (!valid) return;

    const nextStep = FORM_STEPS[currentStepIndex + 1];
    if (nextStep) {
      setActiveTab(nextStep.id);
    }
  }

  function handleBack() {
    const previousStep = FORM_STEPS[currentStepIndex - 1];
    if (previousStep) {
      setActiveTab(previousStep.id);
    }
  }

  function handleTabChange(value: string) {
    const nextIndex = FORM_STEPS.findIndex((step) => step.id === value);
    if (nextIndex === -1) return;

    if (nextIndex <= currentStepIndex) {
      setActiveTab(value as FormStepId);
    }
  }

  async function onSubmit(values: EventFormValues) {
    try {
      const payload = {
        ...values,
        slug: values.slug || slugify(values.title),
        capacity: toInt(values.capacity, 1),
        ticketPrice: toFloat(values.ticketPrice, 0),
      };

      const result = event
        ? await updateEvent({ id: event.id, data: payload })
        : await createEvent(payload);

      if (!result.success) {
        toast.error(result.error ?? "Failed to save event");
        return;
      }

      toast.success(event ? "Event updated" : "Event created");
      onSuccess();
    } catch {
      toast.error("Failed to save event");
    }
  }

  function StepActions() {
    return (
      <div className="mt-6 flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          disabled={isFirstStep}
          onClick={handleBack}
          className={isFirstStep ? "invisible" : undefined}
        >
          <ChevronLeft className="size-4" data-icon="inline-start" />
          Back
        </Button>

        {isLastStep ? (
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <ButtonSpinner label="Saving..." />
            ) : event ? (
              "Update event"
            ) : (
              "Create event"
            )}
          </Button>
        ) : (
          <Button type="button" onClick={handleNext}>
            Next
            <ChevronRight className="size-4" data-icon="inline-end" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, () => {
          toast.error("Please fix the errors before saving");
        })}
        className="flex flex-col gap-6"
      >
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <ScrollArea className="">
            <TabsList variant="line" className="w-full justify-start">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="registration">Registration</TabsTrigger>
              <TabsTrigger value="speakers">Speakers</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <TabsContent value="details" className="mt-4 flex flex-col gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(inputEvent) => {
                        field.onChange(inputEvent);
                        if (!slugManuallyEdited.current) {
                          form.setValue(
                            "slug",
                            slugify(inputEvent.target.value),
                            {
                              shouldValidate: true,
                            },
                          );
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(inputEvent) => {
                        slugManuallyEdited.current = true;
                        field.onChange(inputEvent);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={6} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bannerImage"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUploader
                      value={field.value}
                      onChange={field.onChange}
                      label="Banner image"
                      folder="asm-events/banners"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <StepActions />
          </TabsContent>

          <TabsContent value="schedule" className="mt-4 flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start date</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={toDateTimeLocalValue(field.value)}
                        onChange={(date) =>
                          field.onChange(fromDateTimeLocalValue(date))
                        }
                        placeholder="Select start date & time"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End date</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={toDateTimeLocalValue(field.value)}
                        onChange={(date) =>
                          field.onChange(fromDateTimeLocalValue(date))
                        }
                        placeholder="Select end date & time"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="venue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <NumberInput
                      value={field.value}
                      onChange={field.onChange}
                      min={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <StepActions />
          </TabsContent>

          <TabsContent
            value="registration"
            className="mt-4 flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="isFree"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                  </FormControl>
                  <FormLabel>Free event</FormLabel>
                </FormItem>
              )}
            />

            {!isFree ? (
              <FormField
                control={form.control}
                name="ticketPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ticket price (NGN)</FormLabel>
                    <FormControl>
                      <NumberInput
                        value={field.value}
                        onChange={field.onChange}
                        min={0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            <FormFieldBuilder />

            <StepActions />
          </TabsContent>

          <TabsContent value="speakers" className="mt-4">
            <SpeakerBuilder />

            <StepActions />
          </TabsContent>

          <TabsContent value="assignments" className="mt-4">
            <AssignmentGroupBuilder />

            <StepActions />
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
