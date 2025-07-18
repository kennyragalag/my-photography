// src/app/api/deleteImage/route.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: Request) {
  try {
    const { public_id } = await request.json();

    if (!public_id) {
      return NextResponse.json(
        { message: "Missing public_id" },
        { status: 400 }
      );
    }
    const result = await cloudinary.uploader.destroy(public_id, {
      invalidate: true,
    });

    if (result.result === "ok") {
      return NextResponse.json({ message: "Image deleted successfully" });
    } else if (result.result === "not found") {
      return NextResponse.json({ message: "Image not found" }, { status: 404 });
    } else {
      console.error("Cloudinary deletion failed:", result);
      return NextResponse.json(
        { message: "Failed to delete image on Cloudinary", details: result },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("❌ Error deleting image:", error);
    return NextResponse.json(
      {
        message: "Failed to delete image",
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
