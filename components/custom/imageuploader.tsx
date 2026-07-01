"use client";

import { useRef, useState } from "react";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { ButtonSpinner } from "@/components/custom/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  folder?: string;
  className?: string;
}

export default function ImageUploader({
  value,
  onChange,
  label = "Banner image",
  folder = "asm-events",
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function uploadFile(file: File) {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !result.url) {
        throw new Error(result.error ?? "Upload failed");
      }

      onChange(result.url);
      toast.success("Image uploaded");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      void uploadFile(file);
    }
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Label>{label}</Label>

      <div
        className={cn(
          "relative flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-4 text-center",
          isUploading && "opacity-70"
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="Uploaded preview"
            className="max-h-48 w-full rounded-md object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            {isUploading ? (
              <Loader2 className="size-8 animate-spin" />
            ) : (
              <ImageIcon className="size-8 opacity-60" />
            )}
            <p className="text-sm">
              {isUploading ? "Uploading to Cloudinary..." : "Upload an image for this event"}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? (
              <ButtonSpinner label="Uploading..." />
            ) : (
              <>
                <Upload className="size-4" data-icon="inline-start" />
                {value ? "Replace image" : "Choose image"}
              </>
            )}
          </Button>

          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isUploading}
              onClick={() => onChange("")}
            >
              <X className="size-4" data-icon="inline-start" />
              Remove
            </Button>
          ) : null}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${label}-url`} className="text-xs text-muted-foreground">
          Or paste an image URL
        </Label>
        <Input
          id={`${label}-url`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://..."
          disabled={isUploading}
        />
      </div>
    </div>
  );
}
