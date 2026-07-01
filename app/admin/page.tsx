import AdminLayoutShell from "@/components/admin/layout";
import AdminDashboard from "@/components/admin/modules/dashboard/admin-dashboard";

export default function AdminDashboardPage() {
  return (
    <AdminLayoutShell>
      <AdminDashboard />
    </AdminLayoutShell>
  );
}
