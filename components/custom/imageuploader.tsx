"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { ButtonSpinner } from "@/components/custom/spinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  folder?: string;
  className?: string;
  helperText?: string;
  allowCamera?: boolean;
  showUrlInput?: boolean;
}

export default function ImageUploader({
  value,
  onChange,
  label = "Banner image",
  folder = "asm-events",
  className,
  helperText,
  allowCamera = false,
  showUrlInput = true,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

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
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      void uploadFile(file);
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraReady(false);
  }

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Camera is not supported in this browser");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "user" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraReady(true);
    } catch {
      stopCamera();
      toast.error("Could not access the camera. Check browser permissions.");
      setCameraOpen(false);
    }
  }

  useEffect(() => {
    if (!cameraOpen) {
      stopCamera();
      return;
    }

    void startCamera();

    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraOpen]);

  async function capturePhoto() {
    const video = videoRef.current;
    if (!video || !isCameraReady) return;

    setIsCapturing(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Could not capture photo");
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.92);
      });

      if (!blob) {
        throw new Error("Could not capture photo");
      }

      const file = new File([blob], `camera-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      setCameraOpen(false);
      await uploadFile(file);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not capture photo";
      toast.error(message);
    } finally {
      setIsCapturing(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
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
              {isUploading
                ? "Uploading..."
                : helperText ?? "Upload an image for this event"}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading || isCapturing}
            onClick={() => fileInputRef.current?.click()}
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

          {allowCamera ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading || isCapturing}
              onClick={() => setCameraOpen(true)}
            >
              <Camera className="size-4" data-icon="inline-start" />
              Take a photo
            </Button>
          ) : null}

          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isUploading || isCapturing}
              onClick={() => onChange("")}
            >
              <X className="size-4" data-icon="inline-start" />
              Remove
            </Button>
          ) : null}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {showUrlInput ? (
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
      ) : null}

      <Dialog
        open={cameraOpen}
        onOpenChange={(open) => {
          if (!isCapturing) setCameraOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Take a photo</DialogTitle>
            <DialogDescription>
              Position yourself in the frame, then capture the photo.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-hidden rounded-lg border bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="aspect-[4/3] w-full object-cover"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={isCapturing}
              onClick={() => setCameraOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!isCameraReady || isCapturing}
              onClick={() => void capturePhoto()}
            >
              {isCapturing ? "Saving..." : "Capture photo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
