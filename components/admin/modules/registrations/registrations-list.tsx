"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Download, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import PageBreadcrumb from "@/components/admin/header/pagebreadcrumb";
import PageHeader from "@/components/admin/header/pageHeader";
import { DialogModal, ScrollableDialogModal } from "@/components/custom/custom-modal";
import CustomPagination from "@/components/custom/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useDeleteRegistration, useRegistrations } from "@/hooks/use-registrations";
import { exportToExcel, formatExportDate } from "@/lib/export-excel";
import { formatResponseValue } from "@/lib/form-fields";
import { formatCurrency } from "@/lib/utils";
import type { RegistrationUI } from "@/validators/types/event";

const DownloadNameTagButton = dynamic(
  () =>
    import("@/components/pages/Events/DownloadConfirmationPdf").then(
      (mod) => mod.DownloadConfirmationPdf
    ),
  {
    ssr: false,
    loading: () => (
      <Button variant="outline" size="sm" disabled>
        Preparing name tag...
      </Button>
    ),
  }
);

const PAGE_SIZE = 8;

function canPrintTag(registration: RegistrationUI) {
  return registration.status === "CONFIRMED";
}

function matchesSearch(registration: RegistrationUI, query: string) {
  const haystack = [
    registration.id,
    registration.contactName,
    registration.contactEmail,
    registration.contactPhone,
    registration.eventTitle,
    registration.responsePreview,
    registration.assignedGroup,
    ...registration.labeledResponses.map((entry) => `${entry.label} ${entry.value}`),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export default function RegistrationsList() {
  const { data: events = [] } = useEvents();
  const { mutateAsync: deleteRegistration, isLoading: isDeleting } =
    useDeleteRegistration();

  const [eventId, setEventId] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [paymentStatus, setPaymentStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRegistration, setSelectedRegistration] =
    useState<RegistrationUI | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RegistrationUI | null>(null);

  const selectedEvent = events.find((event) => event.id === eventId);

  const filters = {
    eventId: eventId === "all" ? undefined : eventId,
    status:
      status === "all"
        ? undefined
        : (status as RegistrationUI["status"]),
    paymentStatus:
      paymentStatus === "all"
        ? undefined
        : (paymentStatus as RegistrationUI["paymentStatus"]),
  };

  const { data: registrations = [], isLoading, isError, refetch } =
    useRegistrations(filters);

  const filteredRegistrations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return registrations;
    return registrations.filter((registration) => matchesSearch(registration, query));
  }, [registrations, searchQuery]);

  const totalCount = filteredRegistrations.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, totalCount);
  const paginatedRegistrations = filteredRegistrations.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const exportRows = useMemo(() => {
    const fieldDefinitions =
      selectedEvent?.formFields ??
      events.find((event) => event.id === filteredRegistrations[0]?.eventId)?.formFields ??
      [];

    return filteredRegistrations.map((registration) => {
      const baseRow: Record<string, string | number> = {
        Reference: registration.id,
        Event: registration.eventTitle,
        Name: registration.contactName || registration.responsePreview,
        Email: registration.contactEmail,
        Phone: registration.contactPhone,
        AssignedGroup: registration.assignedGroup ?? "",
        Status: registration.status,
        PaymentStatus: registration.paymentStatus,
        Amount: registration.amount,
        RegisteredAt: formatExportDate(registration.createdAt),
      };

      for (const field of fieldDefinitions) {
        baseRow[field.label] = formatResponseValue(
          registration.responses[field.fieldKey]
        );
      }

      return baseRow;
    });
  }, [filteredRegistrations, selectedEvent, events]);

  function handleExport() {
    exportToExcel(exportRows, `registrations-${Date.now()}`, "Registrations");
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    const result = await deleteRegistration(deleteTarget.id);
    if (!result.success) {
      toast.error(result.error ?? "Failed to delete registration");
      return;
    }

    toast.success("Registration deleted");
    if (selectedRegistration?.id === deleteTarget.id) {
      setSelectedRegistration(null);
    }
    setDeleteTarget(null);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="m-4">
        <CardContent className="flex flex-col gap-3 py-8">
          <p>Failed to load registrations.</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <PageBreadcrumb />
      <div className="flex items-start justify-between gap-3">
        <PageHeader
          title="Registrations"
          description="View, print name tags, and manage attendee registrations."
        />
        <Button
          variant="primary"
          onClick={handleExport}
          disabled={filteredRegistrations.length === 0}
        >
          <Download className="size-4" data-icon="inline-start" />
          Export Excel
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle>All registrations</CardTitle>
          <span className="text-sm text-muted-foreground">
            {totalCount} total
          </span>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Input
              placeholder="Search by name, email, phone, or reference..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
              className="md:col-span-2 xl:col-span-1"
            />
            <Select
              value={eventId}
              onValueChange={(value) => {
                if (value) {
                  setEventId(value);
                  setCurrentPage(1);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All events</SelectItem>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={status}
              onValueChange={(value) => {
                if (value) {
                  setStatus(value);
                  setCurrentPage(1);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={paymentStatus}
              onValueChange={(value) => {
                if (value) {
                  setPaymentStatus(value);
                  setCurrentPage(1);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All payment statuses</SelectItem>
                <SelectItem value="FREE">Free</SelectItem>
                <SelectItem value="UNPAID">Unpaid</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-sm text-muted-foreground">
            {totalCount === 0
              ? "No registrations match your filters."
              : `Showing ${rangeStart}–${rangeEnd} of ${totalCount} registration${totalCount === 1 ? "" : "s"}`}
          </p>

          {paginatedRegistrations.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              No registrations found.
            </div>
          ) : (
            paginatedRegistrations.map((registration) => (
              <Card key={registration.id}>
                <CardContent className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="">
                        {registration.contactName || registration.responsePreview}
                      </h3>
                      <Badge variant="outline">{registration.status}</Badge>
                      <Badge>{registration.paymentStatus}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {registration.eventTitle}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {registration.contactEmail}
                      {registration.contactPhone ? ` · ${registration.contactPhone}` : ""}
                    </p>
                    {registration.assignedGroup ? (
                      <p className="text-sm text-muted-foreground">
                        Group: {registration.assignedGroup}
                      </p>
                    ) : null}
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(registration.amount)} ·{" "}
                      {formatExportDate(registration.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRegistration(registration)}
                    >
                      <Eye className="size-4" data-icon="inline-start" />
                      View
                    </Button>
                    {canPrintTag(registration) ? (
                      <DownloadNameTagButton
                        registration={registration}
                        label="Download name tag"
                        size="sm"
                      />
                    ) : null}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteTarget(registration)}
                    >
                      <Trash2 className="size-4" data-icon="inline-start" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          <CustomPagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      <ScrollableDialogModal
        open={Boolean(selectedRegistration)}
        onOpenChange={(open) => {
          if (!open) setSelectedRegistration(null);
        }}
        title="Registration details"
        maxWidth="sm:max-w-xl"
        scrollHeight="max-h-[60vh]"
      >
        {selectedRegistration ? (
          <div className="flex flex-col gap-3 text-sm pb-4">
            <p>
              <strong>Reference:</strong> {selectedRegistration.id}
            </p>
            <p>
              <strong>Event:</strong> {selectedRegistration.eventTitle}
            </p>
            <p>
              <strong>Status:</strong> {selectedRegistration.status}
            </p>
            <p>
              <strong>Payment:</strong> {selectedRegistration.paymentStatus}
            </p>
            <p>
              <strong>Amount:</strong> {formatCurrency(selectedRegistration.amount)}
            </p>
            <p>
              <strong>Payment ref:</strong> {selectedRegistration.paymentRef ?? "N/A"}
            </p>
            {selectedRegistration.assignedGroup ? (
              <p>
                <strong>Assigned group:</strong> {selectedRegistration.assignedGroup}
              </p>
            ) : null}
            <div className="border-t pt-3 space-y-2">
              <p className="mb-2 font-medium text-primary">Form responses</p>
              {selectedRegistration.labeledResponses.map((entry) => (
                <p key={entry.label}>
                  <strong>{entry.label}:</strong> {entry.value}
                </p>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 border-t pt-3">
              {canPrintTag(selectedRegistration) ? (
                <DownloadNameTagButton
                  registration={selectedRegistration}
                  label="Download name tag"
                  size="sm"
                />
              ) : null}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteTarget(selectedRegistration)}
              >
                <Trash2 className="size-4" data-icon="inline-start" />
                Delete
              </Button>
            </div>
          </div>
        ) : null}
      </ScrollableDialogModal>

      <DialogModal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete registration?"
        description={
          deleteTarget
            ? `This will permanently delete the registration for ${deleteTarget.contactName || deleteTarget.responsePreview}.`
            : undefined
        }
        showFooter
        saveLabel="Delete"
        cancelLabel="Cancel"
        saveVariant="destructive"
        saveDisabled={isDeleting}
        onSave={handleDelete}
      />
    </div>
  );
}
