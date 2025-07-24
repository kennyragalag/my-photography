// pages/api/recentPhotos.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function GET(request: Request) {
  try {
    const result = await cloudinary.search
      .expression("resource_type:image")
      .sort_by("created_at", "desc")
      .max_results(10)
      .execute();

    const photos = result.resources.map((photo: any) => ({
      publicId: photo.public_id,
      url: photo.secure_url,
      album: photo.folder || "Uncategorized",
      uploadedBy: photo.context?.custom?.uploadedBy || "anonymous",
      createdAt: photo.created_at,
    }));

    return NextResponse.json({ photos });
  } catch (error: any) {
    console.error("❌ Error fetching recent photos:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch recent photos",
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
