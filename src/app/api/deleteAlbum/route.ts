import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function DELETE(req: Request) {
  const { album } = await req.json();

  if (!album || typeof album !== "string") {
    return NextResponse.json(
      { message: "Missing or invalid album name" },
      { status: 400 }
    );
  }

  try {
    // Delete all resources under album/ prefix
    await cloudinary.api.delete_resources_by_prefix(`${album}/`);
    await cloudinary.api.delete_folder(album);
    return NextResponse.json({ message: `Album "${album}" deleted.` });
  } catch (error: any) {
    console.error("Cloudinary delete error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
