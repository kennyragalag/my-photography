// src/app/api/albums/route.ts

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const result = await cloudinary.search
      .expression("resource_type:image")
      .sort_by("created_at", "desc")
      .max_results(100)
      .execute();

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
          console.error(`Error fetching cover for album ${folder.name}:`, err);
          return {
            name: folder.name,
            cover: "",
          };
        }
      })
    );
    return NextResponse.json(albums);
  } catch (err: any) {
    return NextResponse.json(
      { message: "Failed to load albums", error: err.message },
      { status: 500 }
    );
  }
}
