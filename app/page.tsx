import Link from "next/link";
import PublicLayoutShell from "@/components/pages/layout/shell";
import {
  EventListingIllustration,
  GuestRegistrationIllustration,
  PaymentIllustration,
} from "@/components/pages/Home/feature-illustrations";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CalendarDays, ClipboardList, CreditCard } from "lucide-react";

const features = [
  {
    title: "ASM events & programs",
    description:
      "See upcoming conferences, retreats, Bible study gatherings, and other ASM programs in one place.",
    illustration: EventListingIllustration,
    icon: CalendarDays,
    accent: "from-asm-lime-green/20 to-asm-ivory",
  },
  {
    title: "Simple registration",
    description:
      "Register for ASM events in a few minutes. No account needed — just fill in the form and confirm your spot.",
    illustration: GuestRegistrationIllustration,
    icon: ClipboardList,
    accent: "from-asm-terracotta/15 to-asm-ivory",
  },
  {
    title: "Secure online payment",
    description:
      "Pay for tickets through Paystack and receive instant confirmation, email updates, and your printable name tag.",
    illustration: PaymentIllustration,
    icon: CreditCard,
    accent: "from-asm-black/10 to-asm-ivory",
  },
] as const;

export default function HomePage() {
  return (
    <PublicLayoutShell>
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-16">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="relative inline-flex items-center overflow-hidden rounded-full border border-asm-terracotta/20 bg-card px-1 py-1 shadow-sm">
            {/* <span className="absolute inset-y-0 left-0 w-1 bg-asm-lime-green" aria-hidden /> */}
            <span className="flex items-center gap-2 pl-4 pr-3 py-1">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-asm-lime-green opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-asm-lime-green" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-asm-terracotta">
                ASM
              </span>
              <span className="h-3 w-px bg-border" aria-hidden />
              <span className="text-sm font-medium text-foreground">
                Anglican Student Movement
              </span>
            </span>
          </div>

          <h1 className="max-w-4xl font-semibold tracking-tight text-[2.5rem] lg:text-5xl xl:text-[3.8rem] leading-tight md:leading-[1.1]">
            Register for ASM{" "}
            <span className="text-asm-terracotta">events & programs</span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            The official registration hub for the Anglican Student Movement — sign up
            for conferences, pay for tickets, and get everything you need before you
            arrive.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/events" className={cn(buttonVariants({ size: "lg" }))}>
              View ASM events
            </Link>
            <Link
              href="/admin/auth/login"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              ASM admin login
            </Link>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {features.map(({ title, description, illustration: Illustration, icon: Icon, accent }) => (
            <Card
              key={title}
              className="group overflow-hidden border-asm-terracotta/15 transition-shadow hover:shadow-md"
            >
              <div
                className={cn(
                  "relative flex items-center justify-center bg-linear-to-br px-6 pt-8 pb-4",
                  accent
                )}
              >
                <div className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-card/80 shadow-sm">
                  <Icon className="size-4 text-asm-terracotta" />
                </div>
                <Illustration />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </PublicLayoutShell>
  );
}
