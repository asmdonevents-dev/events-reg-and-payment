import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function PublicNavbar() {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold flex items-center gap-2">
          <Image src="/images/acm_logo.png" alt="Anglican Student Movement" width={100} height={100} className="w-10 h-10" />
          ASM
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/events"
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            ASM events
          </Link>
          <Link href="/admin/auth/login" className={cn(buttonVariants())}>
            Admin login
          </Link>
        </div>
      </div>
    </header>
  );
}
