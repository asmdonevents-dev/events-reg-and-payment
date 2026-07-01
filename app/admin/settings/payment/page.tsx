import AdminLayoutShell from "@/components/admin/layout";
import PaymentSettingsForm from "@/components/admin/modules/payment-settings/payment-settings-form";

export default function AdminPaymentSettingsPage() {
  return (
    <AdminLayoutShell>
      <PaymentSettingsForm />
    </AdminLayoutShell>
  );
}
