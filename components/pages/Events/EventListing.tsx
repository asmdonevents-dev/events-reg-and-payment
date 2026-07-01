"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  LayoutGrid,
  List,
  MapPin,
  Users,
} from "lucide-react";
import PublicLayoutShell from "@/components/pages/layout/shell";
import BackButton from "@/components/custom/back-button";
import { ImagePreview } from "@/components/custom/image-preview";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvents } from "@/hooks/use-events";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { EventUI } from "@/validators/types/event";

type SortOption =
  | "date-created-desc"
  | "date-created-asc"
  | "title-asc"
  | "title-desc";

type LayoutMode = "grid" | "list";

function sortEvents(events: EventUI[], sortBy: SortOption) {
  const sorted = [...events];

  switch (sortBy) {
    case "date-created-asc":
      return sorted.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    case "title-asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "title-desc":
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    case "date-created-desc":
    default:
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
}

function EventCard({ event, layout }: { event: EventUI; layout: LayoutMode }) {
  const isList = layout === "list";

  return (
    <Card
      className={cn(
        "overflow-hidden",
        isList && "flex flex-col sm:flex-row sm:items-stretch"
      )}
    >
      {event.bannerImage ? (
        <ImagePreview
          src={event.bannerImage}
          alt={`${event.title} flyer`}
          className={cn(
            "block shrink-0",
            isList ? "h-44 w-full sm:h-auto sm:w-52" : "h-44 w-full"
          )}
        />
      ) : null}

      <div className={cn("flex flex-1 flex-col", isList && "min-w-0")}>
        <CardHeader className={cn(isList && "pb-2")}>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className={cn(isList && "text-lg")}>{event.title}</CardTitle>
            <Badge>
              {event.isFree ? "Free" : formatCurrency(event.ticketPrice ?? 0)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent
          className={cn(
            "flex flex-col gap-4",
            isList && "flex-1 sm:flex-row sm:items-end sm:justify-between"
          )}
        >
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Calendar className="size-4 shrink-0" />
              {formatDate(event.startDate)}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-4 shrink-0" />
              {event.venue}
            </span>
            <span className="inline-flex items-center gap-2">
              <Users className="size-4 shrink-0" />
              {event.remainingSeats} seats remaining
            </span>
          </div>

          <Link
            href={`/events/${event.slug}`}
            className={cn(buttonVariants(), "inline-flex w-fit shrink-0")}
          >
            View details
          </Link>
        </CardContent>
      </div>
    </Card>
  );
}

export default function EventsListingPage() {
  const { data: events = [], isLoading } = useEvents({ publishedOnly: true });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date-created-desc");
  const [layout, setLayout] = useState<LayoutMode>("list");

  const displayedEvents = useMemo(() => {
    const filtered = events.filter((event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return sortEvents(filtered, sortBy);
  }, [events, searchQuery, sortBy]);

  return (
    <PublicLayoutShell>
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 pb-10">
        <div>
          <BackButton label="Home" href="/" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
            Upcoming <span className="text-asm-terracotta">Events</span>
          </h1>
          <p className="text-muted-foreground">
            Browse organization events and register as a guest.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="sm:flex-1"
          />

          <div className="flex items-center gap-2">
            <Select
              value={sortBy}
              onValueChange={(value) => {
                if (value) setSortBy(value as SortOption);
              }}
            >
              <SelectTrigger className="w-full min-w-44 sm:w-52">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-created-desc">Date created (newest)</SelectItem>
                <SelectItem value="date-created-asc">Date created (oldest)</SelectItem>
                <SelectItem value="title-asc">Alphabetical (A–Z)</SelectItem>
                <SelectItem value="title-desc">Alphabetical (Z–A)</SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={layout === "grid" ? "Switch to list layout" : "Switch to grid layout"}
              onClick={() => setLayout((current) => (current === "grid" ? "list" : "grid"))}
            >
              {layout === "grid" ? <List /> : <LayoutGrid />}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div
            className={cn(
              "grid gap-4",
              layout === "grid" ? "md:grid-cols-2" : "grid-cols-1"
            )}
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                className={cn("w-full", layout === "grid" ? "h-56" : "h-36")}
              />
            ))}
          </div>
        ) : displayedEvents.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No published events available right now.
            </CardContent>
          </Card>
        ) : (
          <div
            className={cn(
              "grid gap-4",
              layout === "grid" ? "md:grid-cols-2" : "grid-cols-1"
            )}
          >
            {displayedEvents.map((event) => (
              <EventCard key={event.id} event={event} layout={layout} />
            ))}
          </div>
        )}
      </section>
    </PublicLayoutShell>
  );
}
