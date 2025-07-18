// src/app/gallery/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Swal from "sweetalert2";
import { Trash2, Upload, ArrowLeft } from "lucide-react";

interface ImageData {
  url: string;
  public_id: string;
}

interface AlbumData {
  name: string;
  cover: string;
  images?: ImageData[];
}

export default function GalleryPage() {
  const [albums, setAlbums] = useState<AlbumData[]>([]);
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const allowedOwners = (process.env.NEXT_PUBLIC_OWNER_EMAIL || "")
    .split(",")
    .map((email) => email.trim());

  const isOwner = session && allowedOwners.includes(session.user?.email || "");

  const fetchAlbums = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/list");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || `HTTP error! Status: ${res.status}`
        );
      }
      const data = await res.json(); // Parse the JSON response

      // Validate that the received data is an array
      if (!Array.isArray(data)) {
        throw new Error("API response for albums is not an array.");
      }
      setAlbums(data);
    } catch (err: any) {
      console.error("Failed to fetch albums:", err);
      setError(err.message || "Failed to load albums.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  const handleDeleteAlbum = async (albumName: string) => {
    const confirmResult = await Swal.fire({
      title: `Delete album "${albumName}"?`,
      text: "All images in the album will be removed from Cloudinary permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e3342f",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!confirmResult.isConfirmed) return;

    Swal.fire({
      title: "Deleting...",
      text: "Please wait while the album is being deleted.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await fetch("/api/deleteAlbum", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ album: albumName }),
      });

      if (res.ok) {
        Swal.fire("Deleted!", "Album and its contents removed.", "success");
        fetchAlbums(); // Re-fetch albums to update the list
      } else {
        const err = await res.json();
        Swal.fire("Error", err.message || "Failed to delete album", "error");
      }
    } catch (err: any) {
      console.error("Error during album deletion:", err);
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
            className="flex items-center text-white hover:bg-gray-600 px-3 py-1 rounded-md mb-4 transition duration-200"
          >
            <ArrowLeft className="mr-2" size={18} />
            Back
          </button>
        </div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Albums</h1>
          {status === "authenticated" && isOwner && (
            <Link
              href="/uploads"
              className="text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md flex items-center gap-2 transition duration-200"
            >
              <Upload size={20} />
            </Link>
          )}
        </div>

        {loading ? (
          <p className="text-center text-lg">Loading albums...</p>
        ) : error ? (
          <p className="text-center text-lg text-red-500">Error: {error}</p>
        ) : albums.length === 0 ? (
          <p className="text-center text-lg text-gray-400">
            No albums found. Upload some images to create albums!
          </p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {albums.map((album) => (
              <div
                key={album.name}
                className="relative rounded-lg overflow-hidden bg-white text-black shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300"
              >
                <Link
                  href={`/gallery/${encodeURIComponent(album.name)}`}
                  className="block"
                >
                  {album.cover ? (
                    <img
                      src={album.cover}
                      alt={album.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center bg-gray-200 text-gray-500">
                      <span className="text-center text-sm">
                        No Cover Image
                      </span>
                    </div>
                  )}
                  <div className="p-3 text-center">
                    <h2 className="font-semibold text-lg capitalize">
                      {album.name}
                    </h2>
                  </div>
                </Link>
                {isOwner && (
                  <button
                    onClick={() => handleDeleteAlbum(album.name)}
                    className="absolute top-2 right-2 text-red-600 bg-white p-1 rounded-full shadow-md hover:bg-gray-100 transition duration-200"
                    title={`Delete album ${album.name}`}
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
