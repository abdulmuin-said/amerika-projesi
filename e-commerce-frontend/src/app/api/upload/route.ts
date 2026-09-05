import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

if (process.env.CLOUDINARY_URL) {
   cloudinary.config({ secure: true, cloudinary_url: process.env.CLOUDINARY_URL });
} else {
   cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
   });
}

type CloudinaryUploadResult = { secure_url?: string };

function uploadBufferToCloudinary(buffer: Buffer, opts: { folder?: string }) {
   return new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
         { resource_type: "image", folder: opts.folder ?? process.env.CLOUDINARY_FOLDER ?? "e-commerce", overwrite: true },
         (error, result) => {
            if (error) return reject(error);
            const url = (result as CloudinaryUploadResult)?.secure_url;
            if (!url) return reject(new Error("No URL returned from Cloudinary"));
            resolve(url);
         }
      );
      stream.end(buffer);
   });
}

export async function POST(request: NextRequest) {
   try {
      const contentType = request.headers.get("content-type") ?? "";

      // multipart/form-data: file upload from device
      if (contentType.includes("multipart/form-data")) {
         const formData = await request.formData();
         const file = formData.get("file") as File | null;
         if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

         if (file.size > 10 * 1024 * 1024)
            return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 413 });

         const folder = (formData.get("folder") as string | null) ?? process.env.CLOUDINARY_FOLDER ?? "e-commerce";
         const buffer = Buffer.from(await file.arrayBuffer());
         const url = await uploadBufferToCloudinary(buffer, { folder });
         return NextResponse.json({ url });
      }

      // application/json: { imageUrl, folder? } — Google Drive URL
      const json = await request.json().catch(() => null) as { imageUrl?: string; folder?: string } | null;
      const imageUrl = json?.imageUrl?.trim();
      if (!imageUrl) return NextResponse.json({ error: "Provide either file (multipart) or imageUrl (json)" }, { status: 400 });

      const folder = json?.folder ?? process.env.CLOUDINARY_FOLDER ?? "e-commerce";
      const result = await cloudinary.uploader.upload(imageUrl, {
         resource_type: "image", folder, overwrite: true,
      }) as CloudinaryUploadResult;

      const url = result.secure_url;
      if (!url) throw new Error("No URL returned from Cloudinary");
      return NextResponse.json({ url });

   } catch (error) {
      console.error("Image upload error:", error);
      const message = error instanceof Error ? error.message : "Upload failed";
      return NextResponse.json({ error: message }, { status: 500 });
   }
}
