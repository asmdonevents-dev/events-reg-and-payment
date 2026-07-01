import PublicFooter from "@/components/pages/layout/footer";
import PublicNavbar from "@/components/pages/layout/navbar";

export default function PublicLayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
