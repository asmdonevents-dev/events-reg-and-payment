import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getSession } from "@/utils/auth";

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  return { cloudName, apiKey, apiSecret };
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      {
        error:
          "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env",
      },
      { status: 500 }
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  const incoming = await request.formData();
  const file = incoming.get("file");
  const folder = incoming.get("folder")?.toString().trim() || "asm-events";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 });
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{
      secure_url?: string;
      public_id?: string;
    }>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          use_filename: true,
          unique_filename: true,
          overwrite: false,
        },
        (
          error: Error | undefined,
          uploadResult: { secure_url?: string; public_id?: string } | undefined
        ) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(uploadResult ?? {});
        }
      );

      upload.end(buffer);
    });

    if (!result.secure_url) {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upload failed";

    console.error("Cloudinary upload failed:", message);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
