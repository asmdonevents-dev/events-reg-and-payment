import AdminLayoutShell from "@/components/admin/layout";
import EventsContainer from "@/components/admin/modules/events/container";

export default function AdminEventsPage() {
  return (
    <AdminLayoutShell>
      <EventsContainer />
    </AdminLayoutShell>
  );
}
