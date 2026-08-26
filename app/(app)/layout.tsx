"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { broker, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !broker) {
      router.replace("/login");
    }
  }, [isLoading, broker, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">Loading…</div>
    );
  }
  if (!broker) {
    // Redirecting via the effect above — render nothing rather than a flash of protected content.
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
