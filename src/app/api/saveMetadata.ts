// pages/api/saveMetadata.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Use HTTPS
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { url, album, uploadedBy } = req.body;

  if (!url || !album) {
    return res.status(400).json({ message: "Missing url or album" });
  }

  try {
    let publicId: string;

    // Cloudinary context needs to be a flat object, not a pipe-separated string
    // when using cloudinary.api.update.
    // For cloudinary.uploader.upload, the pipe-separated string is often used
    // but a JS object is also supported and preferred.
    const contextData = {
      album: album,
      uploadedBy: uploadedBy || "anonymous",
    };

    // Check if the URL is already a Cloudinary URL
    // If it is, extract the public ID. Otherwise, upload the image.
    if (
      url.startsWith(
        `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`
      )
    ) {
      // Extract public ID from Cloudinary URL (e.g., .../upload/v12345/public_id.jpg)
      // This regex is more robust for extracting public_id
      const match = url.match(/\/v\d+\/(.+?)(?:\.\w+)?$/); // Matches /v[numbers]/public_id[.extension]
      if (match && match[1]) {
        publicId = match[1];
      } else {
        return res
          .status(400)
          .json({ message: "Invalid Cloudinary URL provided" });
      }

      // If it's an existing Cloudinary image, update its context
      await cloudinary.api.update(publicId, {
        context: contextData,
      });
    } else {
      // Upload the image from the provided URL to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(url, {
        folder: album, // Organize images by album in Cloudinary
        context: contextData, // Store metadata as context (using object directly)
        // If you want to use the original filename as public_id (without extension),
        // you might need to parse it from the URL or set a custom public_id.
      });
      publicId = uploadResult.public_id;
    }

    res.status(200).json({ message: "Metadata saved successfully", publicId });
  } catch (error: any) {
    // Type 'any' for error to access properties like 'message'
    console.error("❌ Error saving metadata to Cloudinary:", error);
    // Cloudinary API errors often have a 'message' property
    res.status(500).json({
      message: "Failed to save metadata",
      error: error.message || "Unknown error",
    });
  }
}
