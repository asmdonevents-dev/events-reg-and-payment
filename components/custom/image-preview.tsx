"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ImagePreviewProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
};

export function ImagePreview({
  src,
  alt,
  className,
  imageClassName,
}: ImagePreviewProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "cursor-zoom-in overflow-hidden border-0 bg-transparent p-0 transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        aria-label={`View full image: ${alt}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className={cn("size-full object-cover", imageClassName)}
        />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-5xl gap-0 border-0 bg-transparent p-2 shadow-none sm:p-4"
          showCloseButton
        >
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-h-[85vh] w-full rounded-lg object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
