// app/about/page.tsx
"use client";

import { Mail, Instagram, Facebook, MapPin, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();
  return (
    <>
      <section>
        <div className="py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-white hover:bg-gray-600 px-3 py-1 rounded-md mb-4 transition duration-200"
          >
            <ArrowLeft className="mr-2" size={18} />
            Back
          </button>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-12 text-black">
          <h1 className="text-4xl font-bold mb-6 text-black">About Me</h1>

          <p className="mb-4 text-lg">
            Hi, I'm <span className="font-semibold">Kenny Feb Galagar,</span>{" "}
            —and I work as a software engineer for an IT company while also
            enjoying my hobby of photography.
          </p>

          <p className="mb-4 text-lg">
            On weekdays, I write clean, efficient code to create scalable and
            user-friendly applications. Working in the IT industry has helped me
            improve my problem-solving abilities, attention to detail, and
            ability to think systematically, all of which have a strong
            influence on my photography.
          </p>

          <p className="mb-4 text-lg">
            Riding my motorcycle around Cebu and overseas allows me to explore
            hidden gems, chase light, and film roadside stories. I enjoy sharing
            these moments through my lens, whether it's a peaceful alley in the
            city or a sunrise in the highlands.
          </p>

          <p className="mb-8 text-lg">
            This website brings together my three passions: technology, travel,
            and photography. Feel free to browse my pictures, view my projects,
            or simply enjoy the journey get in touch if you want to Say hello,
            connect, or work together!
          </p>

          <div className="text-md text-black">
            <p className="mb-1 flex items-center gap-2">
              <span>
                <Mail />
              </span>
              <a
                href="mailto:kennygalagar@gmail.com"
                className="text-blue-600 hover:underline"
              >
                kennygalagar@gmail.com
              </a>
            </p>
            <p className="mb-1 flex items-center gap-2">
              <span>
                <Instagram />
              </span>
              <a
                href="https://www.instagram.com/kenzientxx/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Kenny Galagar
              </a>
            </p>
            <p className="mb-1 flex items-center gap-2">
              <span>
                <Facebook />
              </span>
              <a
                href="https://www.facebook.com/kenshotphotography"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Kenshot Photography
              </a>
            </p>
            <p className="mb-1 flex items-center gap-2">
              <span>
                <MapPin />
              </span>
              <span>Purok 1, Dapitan, Cordova, Cebu. Philippines</span>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
