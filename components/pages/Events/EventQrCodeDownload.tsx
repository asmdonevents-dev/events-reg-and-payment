"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EventQrCodeDownloadProps {
  url: string;
  title: string;
  className?: string;
}

function slugifyFileName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default function EventQrCodeDownload({
  url,
  title,
  className,
}: EventQrCodeDownloadProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>();
  const fileName = `asm-event-${slugifyFileName(title) || "link"}-qr.png`;

  useEffect(() => {
    let cancelled = false;

    QRCode.toDataURL(url, {
      width: 220,
      margin: 2,
      color: { dark: "#111111", light: "#ffffff" },
    }).then((dataUrl) => {
      if (!cancelled) setQrDataUrl(dataUrl);
    });

    return () => {
      cancelled = true;
    };
  }, [url]);

  function handleDownload() {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = fileName;
    link.click();
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-asm-terracotta/15 bg-card p-4",
        className
      )}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <QrCode className="size-4 text-asm-terracotta" />
        Event QR code
      </div>

      {qrDataUrl ? (
        <>
          <img
            src={qrDataUrl}
            alt={`QR code for ${title}`}
            className="size-[220px] rounded-lg border border-border bg-white p-2"
          />
          <p className="text-center text-xs text-muted-foreground">
            Scan to open this event page
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleDownload}
          >
            <Download className="size-4" data-icon="inline-start" />
            Download QR code
          </Button>
        </>
      ) : (
        <div className="flex size-[220px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
          Generating QR code...
        </div>
      )}
    </div>
  );
}
