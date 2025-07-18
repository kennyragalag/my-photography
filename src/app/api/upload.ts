// pages/api/upload.ts

import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import cloudinary from "@/lib/cloudinary";
import { v4 as uuidv4 } from "uuid";

// Disable body parsing by Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parsing error:", err);
      return res.status(500).json({ error: "Form parsing failed" });
    }

    const album = (fields.album?.[0] || "uncategorized") as string;
    const uploadedFiles = Array.isArray(files.files)
      ? files.files
      : [files.files];

    try {
      const results = await Promise.all(
        uploadedFiles.map((file: any) => {
          return cloudinary.uploader.upload(file.filepath, {
            folder: `kenshot/${album}`,
            public_id: `${uuidv4()}`,
          });
        })
      );

      const response = results.map((r) => ({
        url: r.secure_url,
        public_id: r.public_id,
        album,
      }));

      res.status(200).json({ success: true, uploaded: response });
    } catch (uploadErr) {
      console.error("Cloudinary upload error:", uploadErr);
      res.status(500).json({ error: "Upload failed" });
    }
  });
}
