// src/components/SessionWatcher.tsx
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function SessionWatcher() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Session expired. You have been logged out.");
      router.push("/login"); // optional: redirect to login
    }
  }, [status]);

  return null;
}
