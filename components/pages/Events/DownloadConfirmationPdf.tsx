"use client";

import { useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { Download } from "lucide-react";
import { RegistrationConfirmationDocument } from "@/components/pdf/registration-confirmation-document";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RegistrationUI } from "@/validators/types/event";

type DownloadConfirmationPdfProps = {
  registration: RegistrationUI;
  label?: string;
  size?: "sm" | "lg" | "md" | "xs" | "icon" | null | undefined;
  className?: string;
};

export function DownloadConfirmationPdf({
  registration,
  label = "Download tag",
  size = "md",
  className,
}: DownloadConfirmationPdfProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>();
  const fileName = `asm-name-tag-${registration.eventSlug}-${registration.id.slice(-8)}.pdf`;

  useEffect(() => {
    QRCode.toDataURL(registration.id, {
      width: 160,
      margin: 1,
      color: { dark: "#111111", light: "#ffffff" },
    }).then(setQrDataUrl);
  }, [registration.id]);

  if (!qrDataUrl) {
    return (
      <span
        className={cn(
          buttonVariants({ variant: "outline", size }),
          "inline-flex opacity-60",
          className
        )}
      >
        Preparing name tag...
      </span>
    );
  }

  return (
    <PDFDownloadLink
      document={
        <RegistrationConfirmationDocument
          registration={registration}
          qrDataUrl={qrDataUrl}
        />
      }
      fileName={fileName}
      className={cn(
        buttonVariants({ variant: "outline", size }),
        "inline-flex gap-2",
        className
      )}
    >
      {({ loading }) => (
        <>
          <Download className="size-4" />
          {loading ? "Preparing PDF..." : label}
        </>
      )}
    </PDFDownloadLink>
  );
}
