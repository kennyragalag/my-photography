// src/app/page.tsx
"use client";

import Carousel from "@/components/Carousel";
import { useEffect, useState } from "react";

type Photo = {
  publicId: string;
  url: string;
  album: string;
  uploadedBy: string;
  createdAt: string;
};

type Album = {
  name: string;
  cover: string;
};

export default function HomePage() {
  const [recent, setRecent] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    const fetchRecentPhotos = async () => {
      try {
        const res = await fetch("/api/recentPhotos");
        if (!res.ok) {
          // Handle HTTP errors (e.g., 404, 500)
          const errorData = await res.json();
          throw new Error(
            errorData.message || `HTTP error! Status: ${res.status}`
          );
        }
        const data = await res.json();
        setRecent(data.photos);
      } catch (err: any) {
        console.error("Failed to fetch recent photos:", err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPhotos();
  }, []);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const res = await fetch("/api/albums");
        const data = await res.json();
        setAlbums(data);
      } catch (err) {
        console.error("Failed to load albums", err);
      }
    };
    fetchAlbums();
  }, []);

  if (loading) {
    return (
      <>
        <section className="text-center py-12">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl font-bold italic mb-4 text-gray-300">
              Welcome to Kenshot Photography
            </h1>
            <p className="text-gray-300 text-lg mb-6">
              Loading recent photos...
            </p>
          </div>
        </section>
      </>
    );
  }

  if (error) {
    return (
      <>
        <section className="text-center py-12">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl font-bold italic mb-4 text-gray-300">
              Welcome to Kenshot Photography
            </h1>
            <p className="text-red-500 text-lg mb-6">
              Error loading photos: {error}
            </p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="text-center py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold italic mb-4 text-gray-300">
            Welcome to Kenshot Photography
          </h1>
          <p className="text-gray-300 text-3x1 mb-6">
            Explore timeless moments captured through the lens. Browse the
            gallery.
          </p>
        </div>
      </section>

      <section>
        {recent.length > 0 ? (
          <Carousel
            images={recent.map((p) => ({
              album: p.album,
              src: p.url, // Use the full Cloudinary URL
            }))}
          />
        ) : (
          <p className="text-gray-700">No recent photos available.</p>
        )}
      </section>

      <section className="text-center text-gray-300 py-12">
        <h2 className="text-2xl font-semibold mb-6">Featured Albums</h2>

        {albums.length === 0 ? (
          <p>No featured albums available.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {albums.map((featured) => (
              <a
                key={featured.name}
                href={`/gallery/${encodeURIComponent(featured.name)}`}
                className="group block bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition"
              >
                <img
                  src={featured.cover}
                  alt={featured.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-3">
                  <h3 className="text-lg font-semibold capitalize text-black">
                    {featured.name}
                  </h3>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
