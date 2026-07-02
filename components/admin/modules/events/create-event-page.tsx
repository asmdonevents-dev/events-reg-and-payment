"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import PageBreadcrumb from "@/components/admin/header/pagebreadcrumb";
import PageHeader from "@/components/admin/header/pageHeader";
import ManageEventForm from "@/components/admin/modules/events/manage-event";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function CreateEventPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 p-4 px-0 sm:px-2">
      <PageBreadcrumb />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title="Create event"
          description="Add a new event for public registration."
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
          <ManageEventForm onSuccess={() => router.push("/admin/events")} />
        </CardContent>
      </Card>
    </div>
  );
}
