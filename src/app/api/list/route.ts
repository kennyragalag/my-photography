import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const album = searchParams.get("album");

  try {
    if (album) {
      // Case 1: Fetch images from a specific album
      const res = await cloudinary.search
        .expression(`folder:${album}`)
        .sort_by("created_at", "desc")
        .max_results(100)
        .execute();

      const images = res.resources.map((img: any) => ({
        url: img.secure_url,
        public_id: img.public_id,
        album,
      }));

      return NextResponse.json(images);
    } else {
      // Case 2: Fetch album folders
      const folderResult = await cloudinary.api.root_folders();

      const folders = Array.isArray(folderResult.folders)
        ? folderResult.folders
        : [];

      const albums = await Promise.all(
        folders.map(async (folder: any) => {
          try {
            const result = await cloudinary.search
              .expression(`folder:${folder.name}`)
              .sort_by("created_at", "desc")
              .max_results(1)
              .execute();

            const cover = result.resources?.[0]?.secure_url || "";

            return {
              name: folder.name,
              cover,
            };
          } catch (err) {
            console.error(
              `Error fetching cover for album ${folder.name}:`,
              err
            );
            return {
              name: folder.name,
              cover: "",
            };
          }
        })
      );

      return NextResponse.json(albums);
    }
  } catch (error: any) {
    console.error("❌ Error in /api/list:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch albums or images",
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
