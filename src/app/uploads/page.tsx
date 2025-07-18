// src/app/upload/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// Optional: Type for album suggestions if you fetch them
// type AlbumSuggestion = { name: string; url: string; };

export default function UploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [albumName, setAlbumName] = useState("");
  const [loading, setLoading] = useState(false);
  const [albums, setAlbums] = useState<{ name: string }[]>([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // --- Environment Variables (Client-side access) ---
  const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_UPLOAD_PRESET =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const allowedOwners = (process.env.NEXT_PUBLIC_OWNER_EMAIL || "")
    .split(",")
    .map((email) => email.trim());

  const isOwner = session && allowedOwners.includes(session.user?.email || "");

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    } else {
      setSelectedFiles([]);
    }
  };

  // Handle upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOwner) {
      Swal.fire(
        "Unauthorized",
        "You must be an authorized user to upload.",
        "warning"
      );
      return;
    }

    if (selectedFiles.length === 0) {
      Swal.fire("No files", "Please select image(s) to upload.", "warning");
      return;
    }

    if (!albumName.trim()) {
      Swal.fire("Album Missing", "Please enter an album name.", "warning");
      return;
    }

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      Swal.fire("Configuration Error", "Missing Cloudinary config.", "error");
      return;
    }

    setLoading(true);
    Swal.fire({
      title: "Uploading...",
      text: "Please wait while your images are being uploaded.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        formData.append("folder", albumName.trim());
        formData.append(
          "context",
          `album=${albumName.trim()}|uploadedBy=${
            session?.user?.email || "anonymous"
          }`
        );

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message || "Cloudinary upload failed"
          );
        }

        const data = await response.json();
        console.log("Uploaded:", data.secure_url);
      }

      Swal.fire("Success!", "All images uploaded successfully!", "success");
      setSelectedFiles([]);
      setAlbumName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      router.push(`/gallery/${encodeURIComponent(albumName.trim())}`);
    } catch (error: any) {
      console.error("Upload error:", error);
      Swal.fire(
        "Upload Failed",
        error.message || "An error occurred.",
        "error"
      );
    } finally {
      setLoading(false);
      Swal.hideLoading();
    }
  };

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const res = await fetch("/api/albums");
        const data = await res.json();
        console.log("RAW albums data:", data);
        if (Array.isArray(data)) {
          setAlbums(data);
          console.log("Albums set:", data.length);
        } else {
          console.warn("Albums not array:", data);
        }
      } catch (err) {
        console.error("Album fetch failed", err);
      }
    };

    fetchAlbums();
  }, []);

  return (
    <>
      <section className="p-6 text-center">
        <div className="py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-white hover:bg-gray-600 px-3 py-1 rounded-md mb-4 transition duration-200"
          >
            <ArrowLeft className="mr-2" size={18} />
            Back
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-6">Upload New Image</h1>

        <div className="justify-items-center">
          <form
            onSubmit={handleUpload}
            className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-md"
          >
            <div className="mb-4">
              <label
                htmlFor="file-input"
                className="block text-lg font-medium text-gray-300 mb-2"
              >
                Select Image:
              </label>
              <input
                type="file"
                id="file-input"
                multiple
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                required
              />
              {selectedFiles.length > 0 && (
                <ul className="mt-2 text-sm text-gray-400 space-y-1">
                  {selectedFiles.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mb-6">
              <label
                htmlFor="album-name"
                className="block text-lg font-medium text-gray-300 mb-2"
              >
                Album Name:
              </label>
              <select
                id="album-select"
                value={isCreatingNew ? "__new__" : albumName}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "__new__") {
                    setIsCreatingNew(true);
                    setAlbumName(""); // clear input
                  } else {
                    setIsCreatingNew(false);
                    setAlbumName(val);
                  }
                }}
                className="w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-violet-500 focus:border-violet-500 mb-2"
              >
                <option value="">-- Select an Album --</option>
                {albums.map((album) => (
                  <option key={album.name} value={album.name}>
                    {album.name}
                  </option>
                ))}
                <option value="__new__">+ Create New Album</option>
              </select>

              {isCreatingNew && (
                <input
                  type="text"
                  id="album-name"
                  value={albumName}
                  onChange={(e) => setAlbumName(e.target.value)}
                  placeholder="Enter new album name"
                  className="mt-2 w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:ring-violet-500 focus:border-violet-500"
                  required
                />
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !selectedFiles || !albumName.trim()}
            >
              {loading ? "Uploading..." : "Upload Image"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
