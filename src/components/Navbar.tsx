"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Menu, X, LogIn, LogOut } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();

  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold italic uppercase  text-gray-600"
        >
          KENSHOT PHOTOGRAPHY
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          aria-label={isOpen ? "Close menu" : "Open menu"}
          className="sm:hidden text-gray-600 hover:text-black"
          onClick={toggleMenu}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex space-x-6 text-sm sm:text-base items-center">
          <NavLinks />
          <UserInfo session={session} />
          <AuthButton session={session} status={status} />
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="sm:hidden px-4 pb-4 space-y-2 bg-white shadow-md transition-all duration-300">
          <NavLinks onClick={toggleMenu} />
          <div className="flex justify-between items-center">
            <UserInfo session={session} />
            <AuthButton session={session} status={status} />
          </div>
        </div>
      )}
    </nav>
  );
}

// ------------------------
// Subcomponents
// ------------------------

function NavLinks({ onClick }: { onClick?: () => void }) {
  return (
    <>
      <Link
        href="/"
        onClick={onClick}
        className="text-gray-600 hover:text-black block sm:inline"
      >
        Home
      </Link>
      <Link
        href="/gallery"
        onClick={onClick}
        className="text-gray-600 hover:text-black block sm:inline"
      >
        Gallery
      </Link>
      <Link
        href="/about"
        onClick={onClick}
        className="text-gray-600 hover:text-black block sm:inline"
      >
        About
      </Link>
    </>
  );
}

function AuthButton({
  session,
  status,
}: {
  session: any;
  status: "loading" | "authenticated" | "unauthenticated";
}) {
  if (status === "loading") {
    return <span className="text-sm text-gray-500">Loading...</span>;
  }

  return session ? (
    <button
      onClick={() => signOut()}
      className="text-gray-600 hover:text-black"
      aria-label="Sign out"
    >
      <LogOut />
    </button>
  ) : (
    <button
      onClick={() => signIn()}
      className="text-gray-600 hover:text-black"
      aria-label="Sign in"
    >
      <LogIn />
    </button>
  );
}

function UserInfo({ session }: { session: any }) {
  if (!session) return null;

  return (
    <div className="flex items-center gap-2">
      {session.user?.name && (
        <span className="text-gray-600 text-sm sm:text-base hover:text-black">
          {session.user.name}
        </span>
      )}
      {session.user?.image && (
        <img
          src={session.user.image}
          alt="User avatar"
          className="w-8 h-8 rounded-full border hidden sm:block"
        />
      )}
    </div>
  );
}
