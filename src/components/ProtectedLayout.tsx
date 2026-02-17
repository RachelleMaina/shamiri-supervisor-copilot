"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token && typeof window !== "undefined") {
      router.replace("/");
    }
  }, [router, token]); 

  if (!token) {
    return <div className="min-h-screen flex items-center justify-center">Redirecting to login...</div>;
  }

  return <>{children}</>;
}