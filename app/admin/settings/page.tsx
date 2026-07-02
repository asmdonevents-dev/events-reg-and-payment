import AdminLayoutShell from "@/components/admin/layout";
import AccountSettings from "@/components/admin/modules/settings/account-settings";

export default function AdminAccountSettingsPage() {
  return (
    <AdminLayoutShell>
      <AccountSettings />
    </AdminLayoutShell>
  );
}
