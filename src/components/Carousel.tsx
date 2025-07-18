"use client";

import { useState, useEffect, useRef } from "react";

interface CarouselImage {
  src: string;
  album: string;
}

export default function Carousel({ images }: { images: CarouselImage[] }) {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const next = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  const prev = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  // Auto-play every 5 seconds
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      next();
    }, 7000);
    return () => clearTimeout(timeoutRef.current!);
  }, [current]);

  // Swipe support
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > 50) prev();
    else if (deltaX < -50) next();
    touchStartX.current = null;
  };

  return (
    <>
      <section
        className="relative w-full max-w-3xl mx-auto bg-black/30 h-[400px] overflow-hidden rounded-lg shadow-lg"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* All images are stacked */}
        {images.map((image, index) => (
          <img
            key={index}
            src={image.src}
            alt={`Photo ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-1000 ease-in-out ${
              index === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          />
        ))}

        {/* Navigation Buttons */}
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white text-xl px-4 py-2 rounded-full z-20"
        >
          ‹
        </button>
        <button
          onClick={next}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white text-xl px-4 py-2 rounded-full z-20"
        >
          ›
        </button>

        {/* Dots/Indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full ${
                current === index ? "bg-white" : "bg-gray-500"
              } transition duration-200`}
              onClick={() => setCurrent(index)}
            />
          ))}
        </div>
      </section>
    </>
  );
}
