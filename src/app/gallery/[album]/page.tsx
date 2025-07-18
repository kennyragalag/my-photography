"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Trash2, Download, X, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";

// Define the type based on what your /api/list/route.ts will return
type ImageData = {
  url: string;
  public_id: string;
  album: string;
};

export default function AlbumPage() {
  const params = useParams();
  const albumRaw = Array.isArray(params.album) ? params.album[0] : params.album;
  const album = decodeURIComponent(albumRaw);

  const [images, setImages] = useState<ImageData[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const allowedOwners = (process.env.NEXT_PUBLIC_OWNER_EMAIL || "")
    .split(",")
    .map((email) => email.trim());

  const isOwner = session && allowedOwners.includes(session.user?.email || "");

  const fetchImages = useCallback(async () => {
    if (!album) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/list?album=${encodeURIComponent(album)}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || `HTTP error! Status: ${res.status}`
        );
      }
      const data: ImageData[] = await res.json();
      setImages(data);
    } catch (err: any) {
      console.error("Failed to fetch images for album:", err);
      setError(err.message || "Failed to load images.");
    } finally {
      setLoading(false);
    }
  }, [album]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleDeleteImage = async (public_id: string) => {
    const confirmResult = await Swal.fire({
      title: "Delete this image?",
      text: "This will permanently remove the image from Cloudinary.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#e3342f",
    });

    if (!confirmResult.isConfirmed) return;

    Swal.fire({
      title: "Deleting...",
      text: "Please wait while the image is being deleted.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await fetch("/api/deleteImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_id }),
      });

      if (res.ok) {
        Swal.fire("Deleted!", "The image has been removed.", "success");
        fetchImages();
      } else {
        const error = await res.json();
        Swal.fire("Error", error.message || "Failed to delete image", "error");
      }
    } catch (err: any) {
      console.error("Error during image deletion:", err);
      Swal.fire(
        "Error",
        err.message || "An unexpected error occurred during deletion",
        "error"
      );
    }
  };

  return (
    <>
      <section className="p-6 text-white">
        <div className="py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-white bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-md mb-4 transition duration-200"
          >
            <ArrowLeft className="mr-2" size={18} />
            Back
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-4 capitalize">{album}</h1>

        {loading ? (
          <p>Loading images...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : images.length === 0 ? (
          <p>No images found in this album.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1">
            {images.map((img, index) => (
              <div
                key={img.public_id || `fallback-key-${index}`}
                className="relative aspect-square group rounded overflow-hidden"
              >
                {img.url ? (
                  <>
                    <img
                      src={img.url}
                      alt={img.public_id}
                      onClick={() => setPreview(img.url)}
                      className="w-full h-full object-cover rounded cursor-pointer transition hover:opacity-90"
                    />

                    {/* Buttons on hover - inside image */}
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      {isOwner && (
                        <button
                          onClick={() => handleDeleteImage(img.public_id)}
                          className="bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <a
                        href={img.url.replace(
                          "/upload/",
                          `/upload/fl_attachment:${img.public_id
                            .split("/")
                            .pop()}`
                        )}
                        download
                        className="bg-white text-black p-1 rounded-full hover:bg-gray-300"
                        title="Download"
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-400 aspect-square">
                    No image URL
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 🔍 Lightbox Preview */}
        {preview && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
            onClick={() => setPreview(null)}
          >
            <div
              className="relative max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={preview}
                alt="Preview"
                className="max-h-[90vh] max-w-full object-contain rounded"
              />
              <button
                className="absolute top-2 right-2 bg-white text-black p-1 rounded-full hover:bg-gray-300"
                onClick={() => setPreview(null)}
              >
                <X size={24} />
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
