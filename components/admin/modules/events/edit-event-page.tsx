"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/admin/header/pagebreadcrumb";
import PageHeader from "@/components/admin/header/pageHeader";
import ManageEventForm from "@/components/admin/modules/events/manage-event";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvent } from "@/hooks/use-events";
import { cn } from "@/lib/utils";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const { data: event, isLoading, isError, refetch } = useEvent(eventId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <PageBreadcrumb />
        <Card>
          <CardContent className="flex flex-col gap-3 py-8">
            <p>Event not found.</p>
            <div className="flex gap-2">
              <Button onClick={() => refetch()}>Retry</Button>
              <Link
                href="/admin/events"
                className={cn(buttonVariants({ variant: "outline" }), "inline-flex")}
              >
                Back to events
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <PageBreadcrumb />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title="Edit event"
          description={`Update details for ${event.title}.`}
        />
        <Link
          href="/admin/events"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex")}
        >
          Back to events
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ManageEventForm
            event={event}
            onSuccess={() => router.push("/admin/events")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
