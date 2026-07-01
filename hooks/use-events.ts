"use client";

import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEventBySlug,
  getEvents,
  updateEvent,
} from "@/data/events";
import type { EventFormValues } from "@/validators/schemas/event";
import type { EventStatus } from "@prisma/client";

export const EVENT_KEYS = {
  all: ["events"] as const,
  list: (status?: EventStatus, publishedOnly?: boolean) =>
    ["events", "list", { status, publishedOnly }] as const,
  detail: (id: string) => ["events", "detail", id] as const,
  slug: (slug: string) => ["events", "slug", slug] as const,
};

export function useEvents(options?: { status?: EventStatus; publishedOnly?: boolean }) {
  return useQuery(EVENT_KEYS.list(options?.status, options?.publishedOnly), () =>
    getEvents(options)
  );
}

export function useEvent(id?: string) {
  return useQuery(EVENT_KEYS.detail(id ?? ""), () => getEventById(id!), {
    enabled: Boolean(id),
  });
}

export function useEventBySlug(slug?: string) {
  return useQuery(EVENT_KEYS.slug(slug ?? ""), () => getEventBySlug(slug!), {
    enabled: Boolean(slug),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation((data: EventFormValues) => createEvent(data), {
    onSuccess: () => queryClient.invalidateQueries(EVENT_KEYS.all),
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, data }: { id: string; data: EventFormValues }) => updateEvent(id, data),
    { onSuccess: () => queryClient.invalidateQueries(EVENT_KEYS.all) }
  );
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation((id: string) => deleteEvent(id), {
    onSuccess: () => queryClient.invalidateQueries(EVENT_KEYS.all),
  });
}
